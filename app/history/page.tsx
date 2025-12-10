// app/history/page.tsx
import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  // Busca as últimas 50 movimentações
  const transactions = await prisma.stockTransaction.findMany({
    take: 50,
    orderBy: { date: 'desc' },
    include: { item: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📜 Histórico de Movimentações</h1>
        <p className="text-slate-500">Registro completo de entradas e saídas.</p>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.date.toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {t.type === 'IN' ? 'ENTRADA' : 'SAÍDA'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{t.item.name}</TableCell>
                <TableCell>{t.quantity} {t.item.unit}</TableCell>
                <TableCell>{t.reason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}