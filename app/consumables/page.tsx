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
          <h1 className="text-2xl font-bold text-white">📦 Itens de Consumo</h1>
          <p className="text-muted-foreground">Gerencie materiais de escritório, limpeza e insumos.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">+ Novo Item</Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Cadastrar Item</DialogTitle>
            </DialogHeader>
            <form action={addConsumable} className="space-y-4 mt-4">
              <Input name="name" placeholder="Nome do Item (ex: Caneta Azul)" required className="bg-background border-input" />
              <Input name="category" placeholder="Categoria (ex: Escritório)" required className="bg-background border-input" />
              <div className="grid grid-cols-2 gap-4">
                <Input name="unit" placeholder="Unidade (ex: cx, un, kg)" required className="bg-background border-input" />
                <Input name="minQuantity" type="number" placeholder="Estoque Mínimo" required className="bg-background border-input" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold">Salvar Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CORRIGIDO: bg-white -> bg-surface e bordas ajustadas */}
      <div className="border border-border rounded-lg bg-surface shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary font-bold">Nome</TableHead>
              <TableHead className="text-primary font-bold">Categoria</TableHead>
              <TableHead className="text-primary font-bold">Estoque Atual</TableHead>
              <TableHead className="text-primary font-bold">Mínimo</TableHead>
              <TableHead className="text-primary font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Nenhum item cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-muted/20">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <span className="font-bold text-white">{item.currentStock}</span> <span className="text-xs text-muted-foreground">{item.unit}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.minQuantity} {item.unit}</TableCell>
                  <TableCell>
                    {item.currentStock <= item.minQuantity ? (
                      <Badge variant="destructive" className="font-bold">BAIXO</Badge>
                    ) : (
                      <Badge className="bg-success text-black hover:bg-success/80 font-bold">OK</Badge>
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