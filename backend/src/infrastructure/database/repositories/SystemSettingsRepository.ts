import { SystemSetting } from "@infrastructure/database/models/SystemSetting";
import { AdminActionLog } from "@infrastructure/database/models/AdminActionLog";
import { SystemSettingsDTO } from "@shared/dtos";

const SETTINGS_KEY = "system";

const DEFAULT_SETTINGS: SystemSettingsDTO = {
  server: {
    api_timezone: "Europe/Berlin",
    rate_limit_requests_per_minute: 120,
    session_timeout_minutes: 30,
    cors_allowed_origins: ["http://localhost:5173"],
  },
  password_policy: {
    min_length: 12,
    require_uppercase: true,
    require_numbers: true,
    require_special_chars: true,
    expiry_days: 180,
  },
  storage: {
    default_storage_type: "local",
    upload_size_limit_mb: 250,
    allowed_file_types: ["pdf", "jpg", "png"],
    s3_bucket: undefined,
    s3_region: undefined,
  },
  email: {
    smtp_server: "smtp.example.com",
    smtp_port: 587,
    email_from_address: "no-reply@schnittmuster.local",
    enable_tls: true,
    templates_enabled: ["welcome", "reset"],
  },
  oauth: {
    oauth_provider: "google",
    google_client_id_masked: "***",
    google_client_secret_masked: "***",
    oauth_callback_url: "http://localhost:3000/api/auth/google/callback",
    enable_google_oauth: false,
  },
  security: {
    enable_2fa: false,
    ip_whitelist: [],
    ip_blacklist: [],
    require_https: true,
    hsts_max_age: 30,
    api_keys_enabled: false,
  },
};

const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const output = { ...(target as any) };
  for (const key of Object.keys(source)) {
    const value = (source as any)[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(output[key] ?? {}, value);
    } else if (value !== undefined) {
      output[key] = value;
    }
  }
  return output;
};

export class SystemSettingsRepository {
  async getSettings(): Promise<SystemSettingsDTO> {
    const record = await SystemSetting.findOne({ where: { key: SETTINGS_KEY } });
    if (!record) {
      return DEFAULT_SETTINGS;
    }
    return deepMerge(DEFAULT_SETTINGS, (record.value ?? {}) as Partial<SystemSettingsDTO>);
  }

  async updateSettings(partial: Partial<SystemSettingsDTO>, adminId: string): Promise<SystemSettingsDTO> {
    const current = await this.getSettings();
    const merged = deepMerge(current, partial);
    const persistedValue = merged as unknown as Record<string, unknown>;
    const defaults = {
      key: SETTINGS_KEY,
      value: persistedValue,
      dataType: "json" as const,
      updatedByAdminId: adminId,
    };
    const [record, created] = await SystemSetting.findOrCreate({ where: { key: SETTINGS_KEY }, defaults });
    if (!created) {
      await record.update({ value: persistedValue, updatedByAdminId: adminId });
    }

    await AdminActionLog.create({
      adminId,
      action: "setting_change",
      changes: partial as Record<string, unknown>,
    });

    return merged;
  }
}
