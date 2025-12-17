// app/login/page.tsx
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/"); // Sucesso: vai para o dashboard
      router.refresh(); // Atualiza para o middleware pegar o cookie novo
    } else {
      const json = await res.json();
      setError(json.error || "Erro ao entrar");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="p-8 w-full max-w-md bg-surface border-border shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-muted-foreground text-sm">Gerenciador de Estoque UNASP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-background border-input"
              placeholder="admin@unasp.br"
              required
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Senha</label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-background border-input"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full font-bold">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}