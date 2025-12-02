import os from "os";
import { Op, fn, col, literal } from "sequelize";
import { SystemMetric } from "@infrastructure/database/models/SystemMetric";
import { User } from "@infrastructure/database/models/User";
import { Pattern } from "@infrastructure/database/models/Pattern";
import { FileStorage } from "@infrastructure/database/models/FileStorage";
import { SystemMetricsDTO, AnalyticsReportDTO } from "@shared/dtos";

const STORAGE_CAPACITY_GB = 250;

type MetricType = "server" | "database" | "api" | "storage";

const nowIso = (): string => new Date().toISOString();

const defaultServerMetrics = (): SystemMetricsDTO["server"] => ({
  cpu_usage: Number((((os.loadavg()?.[0] ?? 0) / Math.max(os.cpus().length, 1)) * 100).toFixed(2)),
  memory_usage: Number((((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)),
  disk_usage: 0,
  uptime_seconds: os.uptime(),
  last_health_check: nowIso(),
});

const defaultDatabaseMetrics = (): SystemMetricsDTO["database"] => ({
  connection_count: 0,
  avg_query_time_ms: 0,
  total_queries_24h: 0,
  slow_queries_count: 0,
  database_size_gb: 0,
  table_count: 0,
  index_health_status: "healthy",
});

const defaultApiMetrics = (): SystemMetricsDTO["api"] => ({
  requests_per_second: 0,
  avg_response_time_ms: 0,
  error_rate_percent: 0,
  total_requests_24h: 0,
  slow_endpoints: [],
  rate_limit_hits: 0,
  bandwidth_gb_24h: 0,
});

const defaultStorageMetrics = (): SystemMetricsDTO["storage"] => ({
  total_storage_gb: STORAGE_CAPACITY_GB,
  used_storage_gb: 0,
  patterns_count: 0,
  avg_pattern_size_mb: 0,
  storage_by_user: [],
});

const getRecentMetric = async (metricType: MetricType): Promise<Record<string, unknown> | null> => {
  const metric = await SystemMetric.findOne({
    where: { metricType },
    order: [["collectedAt", "DESC"]],
  });
  return metric?.metricData ?? null;
};

export class AdminMetricsService {
  async getSystemMetrics(): Promise<SystemMetricsDTO> {
    const [serverData, databaseData, apiData, storageData] = await Promise.all([
      getRecentMetric("server"),
      getRecentMetric("database"),
      getRecentMetric("api"),
      this.computeStorageMetrics(),
    ]);

    const server = { ...defaultServerMetrics(), ...(serverData ?? {}) } as SystemMetricsDTO["server"];
    const database = { ...defaultDatabaseMetrics(), ...(databaseData ?? {}) } as SystemMetricsDTO["database"];
    const api = { ...defaultApiMetrics(), ...(apiData ?? {}) } as SystemMetricsDTO["api"];
    const storage = storageData ?? defaultStorageMetrics();

    if (storage.total_storage_gb) {
      server.disk_usage = Number(((storage.used_storage_gb / storage.total_storage_gb) * 100).toFixed(2));
    }

    return {
      server,
      database,
      api,
      storage,
      timestamp: nowIso(),
    };
  }

  async getAnalyticsReport(period: "daily" | "weekly" | "monthly" = "daily"): Promise<AnalyticsReportDTO> {
    const { start, end } = this.resolveDateRange(period);

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      activeToday,
      activeWeek,
      activeMonth,
      totalPatterns,
      patternsToday,
      patternsWeek,
      storageStats,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { createdAt: { [Op.gte]: this.daysAgo(1) } } }),
      User.count({ where: { createdAt: { [Op.gte]: this.daysAgo(7) } } }),
      User.count({ where: { lastLogin: { [Op.gte]: this.daysAgo(1) } } }),
      User.count({ where: { lastLogin: { [Op.gte]: this.daysAgo(7) } } }),
      User.count({ where: { lastLogin: { [Op.gte]: this.daysAgo(30) } } }),
      Pattern.count(),
      Pattern.count({ where: { createdAt: { [Op.gte]: this.daysAgo(1) } } }),
      Pattern.count({ where: { createdAt: { [Op.gte]: this.daysAgo(7) } } }),
      this.computePatternStorageStats(),
    ]);

    const users = {
      total_users: totalUsers,
      active_users_today: activeToday,
      active_users_week: activeWeek,
      active_users_month: activeMonth,
      new_users_today: newUsersToday,
      new_users_week: newUsersWeek,
      churn_rate_percent: 0,
      avg_session_duration_minutes: 15,
    };

    const patterns = {
      total_patterns: totalPatterns,
      patterns_uploaded_today: patternsToday,
      patterns_uploaded_week: patternsWeek,
      avg_pattern_size_mb: storageStats.avgPatternSizeMb,
      shared_patterns_count: 0,
      shared_patterns_percent: 0,
      patterns_by_category: {},
      most_popular_patterns: [],
    };

    const features = {
      search_usage_count: 0,
      tag_filter_usage_count: 0,
      sharing_usage_count: 0,
      offline_mode_usage_count: 0,
      dark_mode_usage_percent: 0,
    };

    return {
      period,
      date_range: {
        start,
        end,
      },
      users,
      patterns,
      features,
      generated_at: nowIso(),
    };
  }

  private resolveDateRange(period: "daily" | "weekly" | "monthly") {
    const endDate = new Date();
    const startDate = new Date(endDate);
    if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 1);
    }
    return { start: startDate.toISOString(), end: endDate.toISOString() };
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private async computeStorageMetrics(): Promise<SystemMetricsDTO["storage"]> {
    const patternsCount = await Pattern.count();
    const sizeBytes = await FileStorage.sum("size");
    const usedGb = sizeBytes ? Number(sizeBytes) / 1024 / 1024 / 1024 : 0;
    const avgSizeMb = patternsCount > 0 ? (usedGb * 1024) / patternsCount : 0;

    const storageByUserRaw = (await Pattern.findAll({
      attributes: [
        "userId",
        [fn("COUNT", col("Pattern.id")), "patternsCount"],
        [literal('COALESCE(SUM("fileStorage"."size") / 1024.0 / 1024.0 / 1024.0, 0)'), "storageGb"],
      ],
      include: [
        {
          model: FileStorage,
          as: "fileStorage",
          attributes: [],
        },
      ],
      group: ["Pattern.userId"],
      raw: true,
    })) as unknown as Array<{ userId: string; patternsCount: string; storageGb: string }>;

    const storage_by_user = storageByUserRaw.map((row) => ({
      user_id: row.userId,
      storage_gb: Number(row.storageGb),
      patterns_count: Number(row.patternsCount),
    }));

    return {
      total_storage_gb: STORAGE_CAPACITY_GB,
      used_storage_gb: Number(usedGb.toFixed(2)),
      patterns_count: patternsCount,
      avg_pattern_size_mb: Number(avgSizeMb.toFixed(2)),
      storage_by_user,
    };
  }

  private async computePatternStorageStats(): Promise<{ avgPatternSizeMb: number }> {
    const sizeBytes = await FileStorage.sum("size");
    const patternsCount = await Pattern.count();
    if (!sizeBytes || !patternsCount) {
      return { avgPatternSizeMb: 0 };
    }
    const avg = Number(sizeBytes) / 1024 / 1024 / patternsCount;
    return { avgPatternSizeMb: Number(avg.toFixed(2)) };
  }
}
