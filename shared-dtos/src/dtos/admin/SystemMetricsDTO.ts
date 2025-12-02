export interface ServerMetricsDTO {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  uptime_seconds: number
  last_health_check: Date | string
}

export interface DatabaseMetricsDTO {
  connection_count: number
  avg_query_time_ms: number
  total_queries_24h: number
  slow_queries_count: number
  database_size_gb: number
  table_count: number
  index_health_status: 'healthy' | 'warning' | 'critical'
}

export interface APIMetricsDTO {
  requests_per_second: number
  avg_response_time_ms: number
  error_rate_percent: number
  total_requests_24h: number
  slow_endpoints: Array<{
    endpoint: string
    avg_time_ms: number
    call_count: number
  }>
  rate_limit_hits: number
  bandwidth_gb_24h: number
}

export interface StorageMetricsDTO {
  total_storage_gb: number
  used_storage_gb: number
  patterns_count: number
  avg_pattern_size_mb: number
  storage_by_user: Array<{
    user_id: string
    storage_gb: number
    patterns_count: number
  }>
}

export interface SystemMetricsDTO {
  server: ServerMetricsDTO
  database: DatabaseMetricsDTO
  api: APIMetricsDTO
  storage: StorageMetricsDTO
  timestamp: Date | string
}
