// Dashboard and Profile Management Types

export interface ExtendedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Profile information
  bio?: string;
  timezone: string;
  language: string;
  
  // Account metadata
  accountType: 'free' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  lastLoginAt?: Date;
  loginCount: number;
  
  // Security
  twoFactorEnabled: boolean;
  
  // Relations
  settings?: UserSettings;
}

export interface UserSettings {
  id: string;
  userId: string;
  
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  
  // Privacy settings
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analyticsOptOut: boolean;
  
  // Appearance settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  
  // Dashboard preferences
  defaultDashboardView: 'overview' | 'analytics' | 'pipelines';
  showWelcomeMessage: boolean;
  compactMode: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  sessionId?: string | null;
  type: string; // Changed from ActivityType to string for flexibility
  resource?: string | null;
  action: string;
  details?: any; // Use any for maximum flexibility with Prisma JsonValue
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: Date;
}

export type ActivityType = 
  | 'user_login' | 'user_logout' | 'profile_update'
  | 'pipeline_created' | 'pipeline_updated' | 'pipeline_deleted'
  | 'pipeline_executed' | 'settings_changed' | 'security_event'
  | 'admin_action' | 'system_alert';

export interface Activity {
  id: string;
  type: string; // Changed from ActivityType to string for consistency
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'error' | 'warning';
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalPipelines: number;
  activeExecutions: number;
  successRate: number;
  dataProcessed: string;
  lastUpdated: Date;
}

export interface SystemStatus {
  api: ServiceStatus;
  database: ServiceStatus;
  queueProcessing: ServiceStatus;
  lastChecked: Date;
}

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  uptime?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
  systemStatus: SystemStatus;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

// Analytics Types
export interface PipelineMetrics {
  pipelineId: string;
  name: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  dataProcessed: number;
  lastExecuted: Date;
}

export interface ExecutionTrend {
  date: Date;
  executions: number;
  successes: number;
  failures: number;
  averageTime: number;
}

export interface ErrorRate {
  date: Date;
  errorCount: number;
  totalExecutions: number;
  errorRate: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsData {
  pipelineMetrics: PipelineMetrics[];
  executionTrends: ExecutionTrend[];
  errorRates: ErrorRate[];
  performanceMetrics: PerformanceMetric[];
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  pipelineIds?: string[];
  status?: 'success' | 'error' | 'all';
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Profile Management Types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  timezone: string;
  language: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdates {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
}

// Settings Types
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analyticsOptOut: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged?: Date;
  activeSessions: number;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPipelines: number;
  systemHealth: number;
}

export interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
  verified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  status: 'active' | 'suspended' | 'deleted';
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload Types
export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface FileValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange?: DateRange;
  includeHeaders: boolean;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}