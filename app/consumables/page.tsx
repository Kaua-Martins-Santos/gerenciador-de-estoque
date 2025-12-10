// app/consumables/page.tsx
import { prisma } from "@/lib/db";
import { addConsumable } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default async function ConsumablesPage() {
  const items = await prisma.consumableItem.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Itens de Consumo</h1>
          <p className="text-slate-500">Gerencie materiais de escritório, limpeza e insumos.</p>
        </div>
        
        {/* Modal de Cadastro */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ Novo Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Item</DialogTitle>
            </DialogHeader>
            <form action={addConsumable} className="space-y-4 mt-4">
              <Input name="name" placeholder="Nome do Item (ex: Caneta Azul)" required />
              <Input name="category" placeholder="Categoria (ex: Escritório)" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="unit" placeholder="Unidade (ex: cx, un, kg)" required />
                <Input name="minQuantity" type="number" placeholder="Estoque Mínimo" required />
              </div>
              <Button type="submit" className="w-full">Salvar Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-10">
                  Nenhum item cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <span className="font-bold">{item.currentStock}</span> <span className="text-xs text-slate-400">{item.unit}</span>
                  </TableCell>
                  <TableCell>{item.minQuantity} {item.unit}</TableCell>
                  <TableCell>
                    {item.currentStock <= item.minQuantity ? (
                      <Badge variant="destructive">Baixo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}