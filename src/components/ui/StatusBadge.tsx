'use client'

import { installationStatusConfig, taskStatusConfig, issueStatusConfig } from '@/lib/status'
import type { InstallationStatus, TaskStatus, IssueStatus } from '@/types/database'

type StatusBadgeProps = {
  status: InstallationStatus | TaskStatus | IssueStatus
  type?: 'installation' | 'task' | 'issue'
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}

export function StatusBadge({
  status,
  type = 'installation',
  size = 'md',
  showDot = false,
}: StatusBadgeProps) {
  const config = type === 'installation'
    ? installationStatusConfig[status as InstallationStatus]
    : type === 'task'
      ? taskStatusConfig[status as TaskStatus]
      : issueStatusConfig[status as IssueStatus]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${config.bg} ${config.text} ${sizeClasses[size]}
      `}
    >
      {showDot && (
        <span className={`${config.dot} ${dotSizeClasses[size]} rounded-full`} />
      )}
      {config.label}
    </span>
  )
}
