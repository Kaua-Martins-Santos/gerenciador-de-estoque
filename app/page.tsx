import { prisma } from "@/lib/db";
import { 
  AlertTriangle, 
  Hammer, 
  Package, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  PlusCircle, 
  ShoppingCart 
} from "lucide-react";
import { ConferenceButton } from "@/components/ConferenceButton";

export default async function Dashboard() {
  // 1. Contadores (Cards do Topo)
  const totalConsumables = await prisma.consumableItem.count();
  const lowStockItems = await prisma.consumableItem.count({ where: { currentStock: { lte: 5 } } });
  const totalTools = await prisma.permanentItem.count();
  const activeLoans = await prisma.loan.count({ where: { status: 'EMPRESTADO' } });

  // 2. Busca para o botão de conferência
  const allItems = [
    ...(await prisma.consumableItem.findMany()),
    ...(await prisma.permanentItem.findMany())
  ];

  // 3. BUSCA DE ATIVIDADES RECENTES (A MÁGICA ACONTECE AQUI)
  // Busca as últimas 5 de cada tipo para garantir que teremos dados recentes
  const lastTrans = await prisma.stockTransaction.findMany({ 
    take: 5, orderBy: { date: 'desc' }, include: { item: true } 
  });
  
  const lastLoans = await prisma.loan.findMany({ 
    take: 5, orderBy: { loanDate: 'desc' }, include: { item: true } 
  });
  
  const lastReturns = await prisma.loan.findMany({ 
    where: { status: 'DEVOLVIDO', returnDate: { not: null } }, 
    take: 5, orderBy: { returnDate: 'desc' }, include: { item: true } 
  });
  
  const lastItems = await prisma.consumableItem.findMany({ 
    take: 3, orderBy: { createdAt: 'desc' } 
  });
  
  const lastTools = await prisma.permanentItem.findMany({ 
    take: 3, orderBy: { createdAt: 'desc' } 
  });
  
  const lastPurchases = await prisma.purchaseRequest.findMany({ 
    take: 3, orderBy: { data: 'desc' } 
  });

  // Unifica tudo em uma lista só e ordena por data
  const activities = [
    // Transações de Estoque (Entrada/Saída)
    ...lastTrans.map(t => ({
      id: `t-${t.id}`, 
      date: t.date,
      text: `${t.type === 'IN' ? 'Entrada' : 'Saída'}: ${t.quantity}x ${t.item.name}`,
      user: t.department || 'Ajuste Rápido',
      icon: t.type === 'IN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />,
      color: t.type === 'IN' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
    })),
    // Empréstimos
    ...lastLoans.map(l => ({
      id: `l-${l.id}`, 
      date: l.loanDate,
      text: `Empréstimo: ${l.quantity}x ${l.item.name}`,
      user: l.borrowerName,
      icon: <TrendingUp size={18} />,
      color: 'bg-warning/20 text-warning'
    })),
    // Devoluções
    ...lastReturns.map(l => ({
      id: `r-${l.id}`, 
      date: l.returnDate!,
      text: `Devolução: ${l.quantity}x ${l.item.name}`,
      user: l.borrowerName,
      icon: <CheckCircle2 size={18} />,
      color: 'bg-blue-500/20 text-blue-400'
    })),
    // Cadastros Novos (Itens + Ferramentas)
    ...lastItems.map(i => ({
      id: `nc-${i.id}`, 
      date: i.createdAt,
      text: `Novo Item Cadastrado: ${i.name}`,
      user: 'Sistema',
      icon: <PlusCircle size={18} />,
      color: 'bg-purple-500/20 text-purple-400'
    })),
    ...lastTools.map(t => ({
      id: `nt-${t.id}`, 
      date: t.createdAt,
      text: `Nova Ferramenta: ${t.name}`,
      user: 'Sistema',
      icon: <PlusCircle size={18} />,
      color: 'bg-purple-500/20 text-purple-400'
    })),
    // Compras
    ...lastPurchases.map(p => ({
      id: `p-${p.id}`, 
      date: p.data,
      text: `Requisição de Compra: ${p.descricao}`,
      user: p.solicitante,
      icon: <ShoppingCart size={18} />,
      color: 'bg-pink-500/20 text-pink-400'
    }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime()) // Ordena do mais recente para o antigo
  .slice(0, 8); // Pega apenas os 8 últimos eventos

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
          <p className="text-muted-foreground mt-1">Monitoramento em tempo real do setor.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"/>
          <span className="text-xs font-bold text-success">ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Consumíveis" value={totalConsumables} icon={<Package className="text-secondary"/>} border="border-secondary" />
        <Card title="Estoque Baixo" value={lowStockItems} icon={<AlertTriangle className="text-destructive"/>} border="border-destructive" valueColor="text-destructive" />
        <Card title="Ferramentas" value={totalTools} icon={<Hammer className="text-primary"/>} border="border-primary" />
        <Card title="Empréstimos" value={activeLoans} icon={<TrendingUp className="text-warning"/>} border="border-warning" valueColor="text-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === ATIVIDADE RECENTE CORRIGIDA === */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-primary"/> Atividade Recente
          </h3>
          
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/50 text-muted-foreground">
                <p className="mt-2 text-sm">Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-border/50 hover:bg-background/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${activity.color} border border-white/5 shadow-sm`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{activity.text}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{activity.user}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-bold text-muted-foreground">{new Date(activity.date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] text-muted-foreground/60">{new Date(activity.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 shadow-lg h-fit">
          <h3 className="text-lg font-bold text-white mb-6">Avisos Rápidos</h3>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm mb-1">
                <AlertTriangle size={16}/> Crítico
              </div>
              <p className="text-sm text-white/80">{lowStockItems} itens precisam de reposição imediata.</p>
            </div>
            
            <ConferenceButton items={allItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, border, valueColor = "text-white" }: any) {
  return (
    <div className={`bg-surface p-6 rounded-xl border-l-4 ${border} shadow-lg hover:translate-y-[-2px] transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-background rounded-lg">{icon}</div>
      </div>
      <div className={`text-4xl font-bold ${valueColor}`}>{value}</div>
    </div>
  )
}