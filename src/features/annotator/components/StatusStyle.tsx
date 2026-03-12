export default function getTaskStatusStyle(status: string) {
  if (!status)
    return {
      badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
      dot: 'bg-gray-400',
      icon: 'radio_button_unchecked'
    }
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return {
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        dot: 'bg-emerald-400',
        icon: 'task_alt'
      }
    case 'pending':
      return {
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        dot: 'bg-amber-400',
        icon: 'pending'
      }
    case 'active':
    case 'in progress':
      return {
        badge: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
        dot: 'bg-violet-400',
        icon: 'edit_note'
      }
    default:
      return {
        badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
        dot: 'bg-gray-400',
        icon: 'radio_button_unchecked'
      }
  }
}

export function getAnnotationStatusLabel(status: string) {
  switch (status) {
    case 'not_submitted':
      return 'Not Submitted'
    case 'needs_editing':
      return 'Needs Editing'
    case 'corrected':
      return 'Corrected'
    case 'submitted':
      return 'Submitted'
    default:
      return status
  }
}

export function getAnnotationStatusStyle(status: string) {
  switch (status) {
    case 'not_submitted':
      return 'text-gray-400'
    case 'needs_editing':
      return 'text-fuchsia-400'
    case 'corrected':
      return 'text-emerald-400'
    case 'submitted':
      return 'text-violet-400'
    default:
      return 'text-gray-400'
  }
}
