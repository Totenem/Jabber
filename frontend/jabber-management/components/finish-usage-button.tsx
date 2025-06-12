"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface FinishUsageButtonProps {
  bookingId: number
  onFinish: () => void
}

export function FinishUsageButton({ bookingId, onFinish }: FinishUsageButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="border-green-200 text-green-600 hover:bg-green-50"
      onClick={onFinish}
    >
      <CheckCircle className="h-4 w-4 mr-1" />
      Mark as Ended
    </Button>
  )
}
