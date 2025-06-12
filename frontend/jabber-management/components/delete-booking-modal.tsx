import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DeleteBookingModalProps {
  bookingId: number
  isOpen: boolean
  onClose: () => void
  onDelete: (bookingId: number) => Promise<void>
}

export function DeleteBookingModal({ bookingId, isOpen, onClose, onDelete }: DeleteBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(bookingId)
      onClose()
    } catch (error) {
      // Error is already handled in the parent component
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Booking</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 