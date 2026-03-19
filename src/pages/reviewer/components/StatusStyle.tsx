export default function getTaskStatusStyle(status: string) {
  if (!status)
    return {
      badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
      dot: 'bg-gray-400',
      icon: 'radio_button_unchecked'
    }
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        dot: 'bg-emerald-400',
        icon: 'task_alt'
      }
    case 'in_progress':
    case 'in progress':
      return {
        badge: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
        dot: 'bg-violet-400',
        icon: 'edit_note'
      }
    case 'inactive':
      return {
        badge: 'border-red-500/30 bg-red-500/10 text-red-400',
        dot: 'bg-red-400',
        icon: 'highlight_off'
      }
    case 'not_started':
    default:
      return {
        badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
        dot: 'bg-gray-400',
        icon: 'radio_button_unchecked'
      }
  }
}

export function getAnnotationStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'Submitted'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'inactive':
      return 'Inactive'
    default:
      return status || 'Unassigned'
  }
}

export function getAnnotationStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'text-violet-400'
    case 'approved':
      return 'text-emerald-400'
    case 'rejected':
      return 'text-fuchsia-400'
    case 'inactive':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}
