'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  ArrowLeftRight, 
  History, 
  Package, 
  FileText,
  LogOut // Ícone de sair
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/consumables", label: "Itens de Consumo", icon: Package },
  { href: "/assets", label: "Ferramentas", icon: Wrench },
  { href: "/loans", label: "Empréstimos", icon: ArrowLeftRight },
  { href: "/shopping", label: "Compras", icon: ShoppingCart },
  { href: "/repairs", label: "Reparos", icon: Wrench },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/history", label: "Histórico Completo", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh(); // Força a atualização para o middleware barrar o acesso
  }

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Cabeçalho da Sidebar */}
      <div className="p-6 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">
          Almoxarifado
        </span>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé da Sidebar (Botão de Sair) */}
      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair do Sistema
        </Button>
      </div>
    </aside>
  );
}