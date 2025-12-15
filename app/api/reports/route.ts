import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  // Filtro de Data
  const startDate = start ? new Date(start) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = end ? new Date(end) : new Date();
  endDate.setHours(23, 59, 59, 999);

  let data: any[] = [];

  try {
    // 1. INVENTÁRIO GERAL
    if (type === 'inventory') {
      const consumables = await prisma.consumableItem.findMany();
      const tools = await prisma.permanentItem.findMany();
      data = [
        ...consumables.map(i => ({ Tipo: 'Consumo', Nome: i.name, Categoria: i.category, Qtd: i.currentStock, Unidade: i.unit })),
        ...tools.map(i => ({ Tipo: 'Ferramenta', Nome: i.name, Categoria: i.category, Qtd: i.quantity, Unidade: 'Un' }))
      ];
    } 
    
    // 2. ESTOQUE BAIXO
    else if (type === 'low_stock') {
      const items = await prisma.consumableItem.findMany({ where: { currentStock: { lte: 5 } } });
      data = items.map(i => ({
        Nome: i.name, Atual: i.currentStock, Minimo: i.minQuantity, Status: 'CRÍTICO 🚨'
      }));
    }

    // 3. MOVIMENTAÇÕES
    else if (type === 'transactions') {
      const trans = await prisma.stockTransaction.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { item: true }, orderBy: { date: 'desc' }
      });
      data = trans.map(t => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'), Item: t.item.name,
        Tipo: t.type === 'IN' ? 'ENTRADA' : 'SAÍDA', Qtd: t.quantity, Depto: t.department || '-'
      }));
    }

    // 4. EMPRÉSTIMOS
    else if (type === 'loans_history') {
      const loans = await prisma.loan.findMany({
        where: { loanDate: { gte: startDate, lte: endDate } },
        include: { item: true }, orderBy: { loanDate: 'desc' }
      });
      data = loans.map(l => ({
        Data: new Date(l.loanDate).toLocaleDateString('pt-BR'), Funcionario: l.borrowerName,
        Setor: l.department, Item: l.item.name, Qtd: l.quantity, Status: l.status
      }));
    }

    // 5. RELATÓRIO DE COMPRAS DETALHADO
    else if (type === 'purchases') {
      const purchases = await prisma.purchaseRequest.findMany({
        where: { data: { gte: startDate, lte: endDate } }, orderBy: { data: 'desc' }
      });
      data = purchases.map(p => ({
        Data: new Date(p.data).toLocaleDateString('pt-BR'), Solicitante: p.solicitante,
        Depto: p.departamento, Item: p.descricao, Qtd: p.quantidade,
        Valor_Unit: p.valorUnitario || 0,
        Total: (p.valorUnitario || 0) * (parseFloat(p.quantidade) || 0),
        Status: p.status
      }));
    }

    // 6. NOVO: GASTOS POR DEPARTAMENTO (Budget Control)
    else if (type === 'spending_dept') {
      const purchases = await prisma.purchaseRequest.findMany({
        where: { 
          status: 'Entregue', // Considera apenas o que foi efetivamente comprado/entregue
          data: { gte: startDate, lte: endDate } 
        }
      });

      const spendingMap: any = {};
      purchases.forEach(p => {
        const total = (p.valorUnitario || 0) * (parseFloat(p.quantidade) || 0);
        if (!spendingMap[p.departamento]) spendingMap[p.departamento] = 0;
        spendingMap[p.departamento] += total;
      });

      data = Object.keys(spendingMap).map(dept => ({
        Departamento: dept,
        Total_Gasto: spendingMap[dept].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }));
    }

    // 7. NOVO: RELATÓRIO DE REPAROS (Eficiência)
    else if (type === 'repairs_stats') {
      const repairs = await prisma.repairOrder.findMany({
        where: { dataEntrada: { gte: startDate, lte: endDate } }
      });
      data = repairs.map(r => ({
        Data_Entrada: new Date(r.dataEntrada).toLocaleDateString('pt-BR'),
        Item: r.item,
        Problema: r.problema,
        Depto: r.departamento,
        Status: r.status,
        Tempo_no_Setor: r.dataSaida 
          ? Math.ceil((new Date(r.dataSaida).getTime() - new Date(r.dataEntrada).getTime()) / (1000 * 3600 * 24)) + ' dias'
          : 'Ainda em manutenção'
      }));
    }

    return NextResponse.json(data);

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}