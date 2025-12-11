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
        ID: i.id.slice(0, 8), Nome: i.name, Atual: i.currentStock, Minimo: i.minQuantity, Unidade: i.unit, Status: 'CRÍTICO 🚨'
      }));
    }

    // 3. MOVIMENTAÇÕES DE CONSUMO
    else if (type === 'transactions') {
      const trans = await prisma.stockTransaction.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { item: true },
        orderBy: { date: 'desc' }
      });
      data = trans.map(t => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
        Item: t.item.name,
        Tipo: t.type === 'IN' ? 'ENTRADA' : 'SAÍDA',
        Qtd: t.quantity,
        Depto: t.department || '-',
        Motivo: t.reason || '-'
      }));
    }

    // 4. HISTÓRICO DE EMPRÉSTIMOS
    else if (type === 'loans_history') {
      const loans = await prisma.loan.findMany({
        where: { loanDate: { gte: startDate, lte: endDate } },
        include: { item: true },
        orderBy: { loanDate: 'desc' }
      });
      data = loans.map(l => ({
        Data_Retirada: new Date(l.loanDate).toLocaleDateString('pt-BR'),
        Funcionario: l.borrowerName,
        Setor: l.department,
        Ferramenta: l.item.name,
        Qtd: l.quantity,
        Status: l.status,
        Data_Devolucao: l.returnDate ? new Date(l.returnDate).toLocaleDateString('pt-BR') : 'PENDENTE'
      }));
    }

    // 5. RELATÓRIO DE COMPRAS (NOVO!)
    else if (type === 'purchases') {
      const purchases = await prisma.purchaseRequest.findMany({
        where: { 
          status: 'COMPRADO', // Só traz o que já foi comprado
          data: { gte: startDate, lte: endDate } 
        },
        orderBy: { data: 'desc' }
      });

      data = purchases.map(p => ({
        Data: new Date(p.data).toLocaleDateString('pt-BR'),
        Solicitante: p.solicitante,
        Departamento: p.departamento,
        Item: p.descricao,
        Qtd: p.quantidade,
        Prioridade: p.prioridade,
        Obs: p.observacao || '-'
      }));
    }

    // 6. RANKING DE CONSUMO
    else if (type === 'ranking') {
      const trans = await prisma.stockTransaction.groupBy({
        by: ['itemId'],
        where: { type: 'OUT', date: { gte: startDate, lte: endDate } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 20
      });
      const itemIds = trans.map(t => t.itemId);
      const items = await prisma.consumableItem.findMany({ where: { id: { in: itemIds } } });
      
      data = trans.map(t => {
        const item = items.find(i => i.id === t.itemId);
        return { Item: item?.name || 'Excluído', Total_Saida: t._sum.quantity, Unidade: item?.unit || '-' };
      });
    }

    return NextResponse.json(data);

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}