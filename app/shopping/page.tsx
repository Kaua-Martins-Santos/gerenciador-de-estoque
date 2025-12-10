import { prisma } from "@/lib/db";
import { addPurchaseRequest, togglePurchaseStatus, deletePurchase } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default async function ShoppingPage() {
  const requests = await prisma.purchaseRequest.findMany({ orderBy: { data: 'desc' } });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-primary">🛒 Requisições de Compras</h1>
      
      <Card className="p-6 bg-card border-border shadow-lg">
        <form action={addPurchaseRequest} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2"><label className="text-xs font-bold text-muted-foreground mb-2 block">Solicitante</label><Input name="solicitante" required className="bg-background border-input" /></div>
          <div className="md:col-span-2"><label className="text-xs font-bold text-muted-foreground mb-2 block">Depto</label>
            <Select name="departamento" defaultValue="Manutenção">
              <SelectTrigger className="bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Elétrica">Elétrica</SelectItem><SelectItem value="Hidráulica">Hidráulica</SelectItem><SelectItem value="Pintura">Pintura</SelectItem><SelectItem value="Construção">Construção</SelectItem><SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4"><label className="text-xs font-bold text-muted-foreground mb-2 block">Item</label><Input name="descricao" required className="bg-background border-input" /></div>
          <div className="md:col-span-1"><label className="text-xs font-bold text-muted-foreground mb-2 block">Qtd</label><Input name="quantidade" required className="bg-background border-input" /></div>
          <div className="md:col-span-2"><label className="text-xs font-bold text-muted-foreground mb-2 block">Prioridade</label>
            <Select name="prioridade" defaultValue="Normal">
              <SelectTrigger className="bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Urgente">Urgente</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1"><Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90">+</Button></div>
        </form>
      </Card>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-accent/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary font-bold">Data</TableHead>
              <TableHead className="text-primary font-bold">Solicitante</TableHead>
              <TableHead className="text-primary font-bold">Item</TableHead>
              <TableHead className="text-primary font-bold">Qtd</TableHead>
              <TableHead className="text-primary font-bold">Status</TableHead>
              <TableHead className="text-primary font-bold text-right">X</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} className={`border-border hover:bg-accent/50 transition-colors ${req.status === 'COMPRADO' ? 'opacity-40 grayscale' : ''}`}>
                <TableCell>{new Date(req.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-muted-foreground">{req.solicitante}</TableCell>
                <TableCell className="font-medium text-foreground">{req.descricao}</TableCell>
                <TableCell>{req.quantidade}</TableCell>
                <TableCell>
                  <form action={togglePurchaseStatus.bind(null, req.id, req.status)}>
                    <button className={`font-bold text-xs px-2 py-1 rounded border ${req.status==='COMPRADO'?'text-green-400 border-green-500/50 bg-green-500/10':'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'}`}>
                      {req.status}
                    </button>
                  </form>
                </TableCell>
                <TableCell className="text-right">
                  <form action={deletePurchase.bind(null, req.id)}><button className="text-destructive hover:text-red-400 transition-colors"><Trash2 size={16}/></button></form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}