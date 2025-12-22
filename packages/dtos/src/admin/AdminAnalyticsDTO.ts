export interface UserAnalyticsDTO {
  total_users: number
  active_users_today: number
  active_users_week: number
  active_users_month: number
  new_users_today: number
  new_users_week: number
  churn_rate_percent: number
  avg_session_duration_minutes: number
}

export interface PatternAnalyticsDTO {
  total_patterns: number
  patterns_uploaded_today: number
  patterns_uploaded_week: number
  avg_pattern_size_mb: number
  shared_patterns_count: number
  shared_patterns_percent: number
  patterns_by_category: Record<string, number>
  most_popular_patterns: Array<{
    id: string
    name: string
    views: number
    shared_count: number
  }>
}

export interface FeatureUsageDTO {
  search_usage_count: number
  tag_filter_usage_count: number
  sharing_usage_count: number
  offline_mode_usage_count: number
  dark_mode_usage_percent: number
}

export interface AnalyticsReportDTO {
  period: 'daily' | 'weekly' | 'monthly'
  date_range: {
    start: Date | string
    end: Date | string
  }
  users: UserAnalyticsDTO
  patterns: PatternAnalyticsDTO
  features: FeatureUsageDTO
  generated_at: Date | string
}
