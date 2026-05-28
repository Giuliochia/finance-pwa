'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AddTransactionModal } from '@/components/modals/AddTransactionModal'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickAddButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={16} />
        Aggiungi
      </Button>
      {open && (
        <AddTransactionModal
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
