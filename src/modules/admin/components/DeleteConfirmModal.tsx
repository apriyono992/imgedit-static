import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  title?: string
  message: string
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title = 'Konfirmasi Hapus',
  message,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Ya, Hapus
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="text-red-400" size={20} />
        </div>
        <p className="text-sm text-gray-300 leading-relaxed pt-2">{message}</p>
      </div>
    </Modal>
  )
}
