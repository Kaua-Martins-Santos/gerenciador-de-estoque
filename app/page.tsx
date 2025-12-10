import { prisma } from "@/lib/db";
import { AlertTriangle, TrendingUp, Hammer, Package, ArrowRight, Activity } from "lucide-react";

export default async function Dashboard() {
  const totalConsumables = await prisma.consumableItem.count();
  const lowStockItems = await prisma.consumableItem.count({ where: { currentStock: { lte: 5 } } });
  const totalTools = await prisma.permanentItem.count();
  const activeLoans = await prisma.loan.count({ where: { status: 'EMPRESTADO' } });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
          <p className="text-muted mt-1">Monitoramento em tempo real do setor.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"/>
          <span className="text-xs font-bold text-success">ONLINE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Consumíveis" value={totalConsumables} icon={<Package className="text-secondary"/>} border="border-secondary" />
        <Card title="Estoque Baixo" value={lowStockItems} icon={<AlertTriangle className="text-danger"/>} border="border-danger" valueColor="text-danger" />
        <Card title="Ferramentas" value={totalTools} icon={<Hammer className="text-primary"/>} border="border-primary" />
        <Card title="Empréstimos" value={activeLoans} icon={<TrendingUp className="text-warning"/>} border="border-warning" valueColor="text-warning" />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Principal */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-primary"/> Atividade Recente
          </h3>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/50 text-muted">
            <BarChart3Icon />
            <p className="mt-2 text-sm">O gráfico de movimentações será carregado aqui.</p>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Avisos Rápidos</h3>
          <div className="space-y-4">
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <div className="flex items-center gap-2 text-danger font-bold text-sm mb-1">
                <AlertTriangle size={16}/> Crítico
              </div>
              <p className="text-sm text-white/80">{lowStockItems} itens precisam de reposição imediata.</p>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <ArrowRight size={16}/> Inventário
              </div>
              <p className="text-sm text-white/80">Conferência mensal agendada para sexta-feira.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes Auxiliares para Limpeza do Código
function Card({ title, value, icon, border, valueColor = "text-white" }: any) {
  return (
    <div className={`bg-surface p-6 rounded-xl border-l-4 ${border} shadow-lg hover:translate-y-[-2px] transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-muted text-xs font-bold uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-background rounded-lg">{icon}</div>
      </div>
      <div className={`text-4xl font-bold ${valueColor}`}>{value}</div>
    </div>
  )
}

function BarChart3Icon() { // Ícone simples feito com div para ilustrar
  return (
    <div className="flex gap-1 items-end h-10">
      <div className="w-2 h-4 bg-muted rounded-sm"/>
      <div className="w-2 h-8 bg-muted rounded-sm"/>
      <div className="w-2 h-6 bg-muted rounded-sm"/>
    </div>
  )
}