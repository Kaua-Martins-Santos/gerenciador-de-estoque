'use client'

import { useState } from "react"
import { PackageMinus } from "lucide-react"
import { registerConsumption } from "@/app/actions/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"

interface ConsumeButtonProps {
  itemId: string
  itemName: string
  currentStock: number
  unit: string
}

export function ConsumeButton({ itemId, itemName, currentStock, unit }: ConsumeButtonProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  async function clientAction(formData: FormData) {
    const result = await registerConsumption(formData)
    if (result?.success) {
      setOpen(false)
      setError("")
    } else {
      setError(result?.message || "Erro ao registrar saída")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors mr-1"
          title="Registrar Saída / Consumo"
        >
          <PackageMinus size={18} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-surface border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Saída</DialogTitle>
          <DialogDescription>
            Retirar <strong>{itemName}</strong> do estoque.
            <br/>Disponível: {currentStock} {unit}
          </DialogDescription>
        </DialogHeader>

        <form action={clientAction} className="space-y-4 mt-2">
          <input type="hidden" name="itemId" value={itemId} />
          
          <div className="space-y-2">
            <Label>Quantidade a retirar</Label>
            <Input 
              name="quantity" 
              type="number" 
              placeholder="0" 
              max={currentStock}
              min={1}
              required 
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Quem retirou / Destino</Label>
            <Input 
              name="department" 
              placeholder="Ex: TI, Limpeza, João..." 
              required 
              className="bg-background border-input"
            />
          </div>

          {error && (
            <div className="text-destructive text-sm font-bold bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}