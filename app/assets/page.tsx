import { prisma } from "@/lib/db";
import { addAsset } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default async function AssetsPage() {
  const assets = await prisma.permanentItem.findMany({
    include: { loans: { where: { status: 'EMPRESTADO' } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">🔨 Ferramentas (Patrimônio)</h1>
          <p className="text-muted-foreground">Cadastro simplificado de ferramentas.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">+ Nova Ferramenta</Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-border text-foreground">
            <DialogHeader><DialogTitle>Cadastrar Ferramenta</DialogTitle></DialogHeader>
            <form action={addAsset} className="space-y-4 mt-4">
              <Input name="name" placeholder="Nome (ex: Furadeira Bosch)" required className="bg-background border-input"/>
              <Input name="category" placeholder="Categoria (ex: Elétrica)" required className="bg-background border-input"/>
              <Input name="quantity" type="number" placeholder="Quantidade Total no Estoque" required className="bg-background border-input"/>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela Dark Mode */}
      <div className="border border-border rounded-lg bg-surface shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary font-bold">Ferramenta</TableHead>
              <TableHead className="text-primary font-bold">Categoria</TableHead>
              <TableHead className="text-primary font-bold">Total</TableHead>
              <TableHead className="text-primary font-bold">Disponível</TableHead>
              <TableHead className="text-primary font-bold">Emprestados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const emprestados = asset.loans.reduce((acc, l) => acc + l.quantity, 0);
              const disponivel = asset.quantity - emprestados;
              return (
                <TableRow key={asset.id} className="border-border hover:bg-muted/20">
                  <TableCell className="font-medium text-white">{asset.name}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.category}</TableCell>
                  <TableCell className="text-white">{asset.quantity}</TableCell>
                  <TableCell className="font-bold text-success">{disponivel}</TableCell>
                  <TableCell className="text-warning font-bold">{emprestados}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}