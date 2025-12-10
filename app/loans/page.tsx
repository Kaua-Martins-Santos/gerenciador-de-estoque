'use client'

import { useEffect, useState } from "react";
import { returnLoan } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Printer, CheckCircle2, Search } from "lucide-react";

export default function LoansPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/loans-data').then(res => res.json()).then(data => {
      setItems(data.items);
      setLoans(data.loans);
    });
  }, []);

  async function handleLoan(formData: FormData) {
    try {
      const res = await fetch('/api/create-loan', { method: 'POST', body: formData });
      const loan = await res.json();
      if(loan.error) throw new Error(loan.error);
      printTicket(loan);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      alert(e.message);
    }
  }

  function printTicket(loan: any) {
    const content = `
      <html><body style="font-family: monospace; width: 80mm; font-size: 12px; text-align: center;">
          <div style="font-weight: bold; font-size: 14px;">UNASP - MANUTENCAO</div>
          <div>CONTROLE DE FERRAMENTAS</div>
          <br/>
          <div style="text-align: left;">DATA: ${new Date().toLocaleString('pt-BR')}</div>
          <div style="text-align: left;">RETIRADO POR: ${loan.borrowerName}</div>
          <div style="text-align: left;">SETOR: ${loan.department}</div>
          <hr style="border-top: 1px dashed black;"/>
          <div style="font-weight: bold; text-align: left; font-size: 14px;">${loan.quantity}x ${loan.item.name}</div>
          <hr style="border-top: 1px dashed black;"/>
          <br/><br/>
          <div style="border-top: 1px solid black; margin-top: 20px;">ASSINATURA RESPONSAVEL</div>
      </body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <span className="bg-yellow-500/10 p-2 rounded-lg text-yellow-400 border border-yellow-500/20">📝</span> 
        Registrar Empréstimo
      </h1>
      
      <Card className="border-border bg-card shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg font-medium text-white">Nova Retirada</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleLoan(new FormData(e.currentTarget)) }} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ferramenta</label>
              <Select name="itemId" required>
                <SelectTrigger className="bg-background border-border text-foreground h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {items.map((i: any) => (
                    <SelectItem key={i.id} value={i.id}>{i.name} (Disp: {i.quantity - (i.loans?.reduce((a:any,b:any)=>a+b.quantity,0)||0)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quantidade</label>
              <Input name="quantity" type="number" defaultValue="1" min="1" required className="bg-background border-border text-foreground h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Funcionário</label>
              <Input name="borrowerName" placeholder="Nome Completo" required className="bg-background border-border text-foreground h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Setor</label>
              <Select name="department" required defaultValue="Elétrica">
                <SelectTrigger className="bg-background border-border text-foreground h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {['Elétrica','Hidráulica','Serralheria','Marmoraria','Construção','Refrigeração','Pintura'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-lg shadow-primary/10">
              <Printer className="mr-2 h-5 w-5"/> IMPRIMIR COMPROVANTE
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary">Data</TableHead>
              <TableHead className="text-primary">Nome</TableHead>
              <TableHead className="text-primary">Setor</TableHead>
              <TableHead className="text-primary">Item</TableHead>
              <TableHead className="text-primary text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.filter((l:any) => l.status === 'EMPRESTADO').map((loan: any) => (
              <TableRow key={loan.id} className="border-border hover:bg-muted/30">
                <TableCell>{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium text-white">{loan.borrowerName}</TableCell>
                <TableCell>{loan.department}</TableCell>
                <TableCell><span className="text-yellow-400 font-bold">{loan.quantity}x</span> {loan.item.name}</TableCell>
                <TableCell className="text-center">
                  <form action={returnLoan.bind(null, loan.id)}>
                    <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                      <CheckCircle2 className="mr-2 h-4 w-4"/> Devolver
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}