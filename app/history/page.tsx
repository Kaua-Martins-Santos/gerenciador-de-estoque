import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Hammer, Package, RotateCcw, PlusSquare, ShoppingCart } from "lucide-react";

export default async function HistoryPage() {
  // 1. Buscas no Banco de Dados
  const transactions = await prisma.stockTransaction.findMany({ include: { item: true }, orderBy: { date: 'desc' }, take: 20 });
  const loans = await prisma.loan.findMany({ include: { item: true }, orderBy: { loanDate: 'desc' }, take: 20 });
  const returns = await prisma.loan.findMany({ where: { status: 'DEVOLVIDO', returnDate: { not: null } }, include: { item: true }, orderBy: { returnDate: 'desc' }, take: 20 });
  const newConsumables = await prisma.consumableItem.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  const newTools = await prisma.permanentItem.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  const purchases = await prisma.purchaseRequest.findMany({ orderBy: { data: 'desc' }, take: 20 });

  // 2. Unificação dos Dados
  const history = [
    // Transações
    ...transactions.map(t => ({
      id: `t-${t.id}`, date: t.date, type: t.type === 'IN' ? 'ENTRADA' : 'SAÍDA', category: 'CONSUMO',
      item: t.item.name, quantity: t.quantity, user: t.department || '-', details: t.reason || '-'
    })),
    // Empréstimos
    ...loans.map(l => ({
      id: `l-${l.id}`, date: l.loanDate, type: 'EMPRÉSTIMO', category: 'FERRAMENTA',
      item: l.item.name, quantity: l.quantity, user: l.borrowerName, details: l.department
    })),
    // Devoluções
    ...returns.map(l => ({
      id: `r-${l.id}`, date: l.returnDate!, type: 'DEVOLUÇÃO', category: 'FERRAMENTA',
      item: l.item.name, quantity: l.quantity, user: l.borrowerName, details: "Devolvido ao Estoque"
    })),
    // Cadastros Novos
    ...newConsumables.map(c => ({
      id: `nc-${c.id}`, date: c.createdAt, type: 'CADASTRO', category: 'CONSUMO',
      item: c.name, quantity: c.currentStock, user: 'Sistema', details: `Novo Item (${c.unit})`
    })),
    ...newTools.map(t => ({
      id: `nt-${t.id}`, date: t.createdAt, type: 'CADASTRO', category: 'FERRAMENTA',
      item: t.name, quantity: t.quantity, user: 'Sistema', details: 'Novo Patrimônio'
    })),
    // Compras (NOVO)
    ...purchases.map(p => ({
      id: `p-${p.id}`, date: p.data, type: 'COMPRA', category: 'ADMIN',
      item: p.descricao, quantity: p.quantidade, user: p.solicitante, details: `Prioridade: ${p.prioridade}`
    }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="text-primary"/> Histórico Geral
        </h1>
        <p className="text-muted-foreground">Linha do tempo de todas as movimentações, registros e compras.</p>
      </div>

      <div className="border border-border rounded-lg bg-surface shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary font-bold">Data / Hora</TableHead>
              <TableHead className="text-primary font-bold">Tipo</TableHead>
              <TableHead className="text-primary font-bold">Ação</TableHead>
              <TableHead className="text-primary font-bold">Item</TableHead>
              <TableHead className="text-primary font-bold">Qtd</TableHead>
              <TableHead className="text-primary font-bold">Responsável / Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h.id} className="border-border hover:bg-muted/20 transition-colors">
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {h.date.toLocaleDateString('pt-BR')} <span className="opacity-50">{h.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase">
                    {h.category === 'CONSUMO' && <><Package size={14} className="text-secondary"/> <span className="text-secondary">Consumo</span></>}
                    {h.category === 'FERRAMENTA' && <><Hammer size={14} className="text-warning"/> <span className="text-warning">Patrimônio</span></>}
                    {h.category === 'ADMIN' && <><ShoppingCart size={14} className="text-accent"/> <span className="text-accent">Admin</span></>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`font-bold ${
                    h.type === 'ENTRADA' ? 'bg-success/20 text-success' :
                    h.type === 'SAÍDA' ? 'bg-destructive/20 text-destructive' :
                    h.type === 'DEVOLUÇÃO' ? 'bg-blue-500/20 text-blue-400' :
                    h.type === 'CADASTRO' ? 'bg-purple-500/20 text-purple-400' :
                    h.type === 'COMPRA' ? 'bg-pink-500/20 text-pink-400' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {h.type === 'DEVOLUÇÃO' && <RotateCcw className="mr-1 h-3 w-3" />}
                    {h.type === 'CADASTRO' && <PlusSquare className="mr-1 h-3 w-3" />}
                    {h.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-white">{h.item}</TableCell>
                <TableCell className="text-white font-bold">{h.quantity}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {h.user} <span className="opacity-50 text-xs">({h.details})</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}