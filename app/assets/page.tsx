// app/assets/page.tsx
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
          <h1 className="text-2xl font-bold text-slate-800">🔨 Ferramentas (Patrimônio)</h1>
          <p className="text-slate-500">Cadastro simplificado de ferramentas.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild><Button className="bg-[#cba6f7] text-[#181825] font-bold">+ Nova Ferramenta</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Ferramenta</DialogTitle></DialogHeader>
            <form action={addAsset} className="space-y-4 mt-4">
              <Input name="name" placeholder="Nome (ex: Furadeira Bosch)" required />
              <Input name="category" placeholder="Categoria (ex: Elétrica)" required />
              <Input name="quantity" type="number" placeholder="Quantidade Total no Estoque" required />
              <Button type="submit" className="w-full bg-[#cba6f7] text-[#181825]">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ferramenta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead>Emprestados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const emprestados = asset.loans.reduce((acc, l) => acc + l.quantity, 0);
              const disponivel = asset.quantity - emprestados;
              return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.quantity}</TableCell>
                  <TableCell className="font-bold text-green-600">{disponivel}</TableCell>
                  <TableCell className="text-amber-600">{emprestados}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}