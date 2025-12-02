export interface ServerSettingsDTO {
  api_timezone: string
  rate_limit_requests_per_minute: number
  session_timeout_minutes: number
  cors_allowed_origins: string[]
}

export interface PasswordPolicyDTO {
  min_length: number
  require_uppercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  expiry_days?: number
}

export interface StorageSettingsDTO {
  default_storage_type: 'local' | 's3' | 'database'
  upload_size_limit_mb: number
  allowed_file_types: string[]
  s3_bucket?: string
  s3_region?: string
}

export interface EmailSettingsDTO {
  smtp_server: string
  smtp_port: number
  email_from_address: string
  enable_tls: boolean
  templates_enabled: string[]
}

export interface OAuthSettingsDTO {
  oauth_provider: string
  google_client_id_masked: string
  google_client_secret_masked: string
  oauth_callback_url: string
  enable_google_oauth: boolean
}

export interface SecuritySettingsDTO {
  enable_2fa: boolean
  ip_whitelist: string[]
  ip_blacklist: string[]
  require_https: boolean
  hsts_max_age: number
  api_keys_enabled: boolean
}

export interface SystemSettingsDTO {
  server: ServerSettingsDTO
  password_policy: PasswordPolicyDTO
  storage: StorageSettingsDTO
  email: EmailSettingsDTO
  oauth: OAuthSettingsDTO
  security: SecuritySettingsDTO
}
