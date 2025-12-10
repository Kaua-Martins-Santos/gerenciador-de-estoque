import Link from "next/link";
import { LayoutDashboard, Package, Hammer, FileText, ShoppingCart, BarChart3, LogOut, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-surface border-r border-border shadow-2xl flex flex-col">
      {/* Logo */}
      <div className="p-8 pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-primary/20 text-primary p-1 rounded">UN</span>ASPEC
        </h1>
        <p className="text-xs text-muted mt-1 uppercase tracking-widest font-semibold">Manutenção</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-muted uppercase tracking-wider mb-2">Principal</p>
        <NavItem href="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
        
        <p className="px-4 text-xs font-bold text-muted uppercase tracking-wider mt-6 mb-2">Gestão</p>
        <NavItem href="/consumables" icon={<Package size={20}/>} label="Consumíveis" color="text-secondary" />
        <NavItem href="/assets" icon={<Hammer size={20}/>} label="Ferramentas" color="text-primary" />
        <NavItem href="/loans" icon={<FileText size={20}/>} label="Empréstimos" color="text-warning" />
        
        <p className="px-4 text-xs font-bold text-muted uppercase tracking-wider mt-6 mb-2">Admin</p>
        <NavItem href="/shopping" icon={<ShoppingCart size={20}/>} label="Compras" color="text-accent" />
        <NavItem href="/reports" icon={<BarChart3 size={20}/>} label="Relatórios" />
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-border bg-black/20">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, color = "text-muted", active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-primary/10 text-white' : 'hover:bg-white/5 text-muted hover:text-white'}`}
    >
      <div className={`${active ? 'text-primary' : color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  )
}