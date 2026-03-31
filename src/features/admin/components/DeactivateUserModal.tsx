import { Button } from '@/shared/components/ui/Button'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { User } from '@/shared/types/api.types'

interface DeactivateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  user?: User
  isLoading?: boolean
}

export default function DeactivateUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading
}: DeactivateUserModalProps) {
  if (!user) return null

  return (
    <GlassModal
      open={isOpen}
      onCancel={onClose}
      width={400}
    >
      <div className="flex flex-col items-center text-center p-6 pt-10 pb-8">
        <div className="mb-5 relative">
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"></div>
          <ExclamationCircleOutlined className="text-[64px] text-rose-500 relative z-10 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Deactivate User?
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed mb-8 px-2">
          Are you sure you want to deactivate <strong className="text-rose-400">{user.fullName || user.username}</strong>?

        </p>

        <div className="flex w-full gap-3 mt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-11 border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 h-11 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all font-bold shadow-none"
          >
            Deactivate
          </Button>
        </div>
      </div>
    </GlassModal>
  )
}
