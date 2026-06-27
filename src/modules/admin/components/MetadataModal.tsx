import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface MetadataModalProps {
  metadata: Record<string, unknown> | null
  toolName?: string
  onClose: () => void
}

export function MetadataModal({ metadata, toolName, onClose }: MetadataModalProps) {
  const [copied, setCopied] = useState(false)
  const json = metadata ? JSON.stringify(metadata, null, 2) : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      isOpen={!!metadata}
      onClose={onClose}
      title={toolName ? `Metadata — ${toolName}` : 'Metadata'}
      size="md"
      footer={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          leftIcon={copied ? <Check size={13} /> : <Copy size={13} />}
        >
          {copied ? 'Disalin!' : 'Salin JSON'}
        </Button>
      }
    >
      <pre className="text-xs text-emerald-400 bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-auto max-h-72 font-mono leading-relaxed whitespace-pre-wrap break-all">
        {json || '{}'}
      </pre>
    </Modal>
  )
}
