'use client'

import { useState, useTransition } from "react"
import { Trash2, AlertTriangle } from "lucide-react"
import { deleteItem } from "@/app/actions/inventory"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"

interface DeleteButtonProps {
  itemId: string
  itemName: string
  type: 'consumable' | 'asset'
}

export function DeleteButton({ itemId, itemName, type }: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteItem(itemId, type)
      
      if (result.success) {
        setOpen(false)
      } else {
        setError(result.message || "Erro ao excluir")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={18} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-surface border-border sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl">Excluir Item?</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Você tem certeza que deseja excluir <strong>{itemName}</strong>?
            <br />
            Essa ação removerá o item e todo seu histórico permanentemente.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => { setOpen(false); setError("") }}
            disabled={isPending}
            className="border-border text-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
          >
            {isPending ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}