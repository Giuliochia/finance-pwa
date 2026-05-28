'use client'
import { useState } from 'react'
import { AuditModal } from '@/components/modals/AuditModal'
import { getDueAudits } from '@/lib/utils'
import type { RecurringExpense } from '@/lib/types'

export function AuditChecker({ recurring }: { recurring: RecurringExpense[] }) {
  const due = getDueAudits(recurring)
  const [queue, setQueue] = useState<RecurringExpense[]>(due)

  if (queue.length === 0) return null

  return (
    <AuditModal
      expense={queue[0]}
      onDone={() => setQueue((q) => q.slice(1))}
    />
  )
}
