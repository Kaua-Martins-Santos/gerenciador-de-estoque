'use client'

import { useEffect, useState } from "react";
import { returnLoan } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Printer, CheckCircle2, RefreshCw, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoansPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carrinho
  const [cart, setCart] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [borrowerName, setBorrowerName] = useState("");
  const [department, setDepartment] = useState("Elétrica");

  const router = useRouter();

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/loans-data', { cache: 'no-store' });
      const data = await res.json();
      setItems(data.items);
      setLoans(data.loans);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function addToCart() {
    if (!selectedItem) return alert("Selecione uma ferramenta!");
    const itemObj = items.find(i => i.id === selectedItem);
    const available = itemObj.quantity - (itemObj.loans?.reduce((a:any,b:any)=>a+b.quantity,0)||0);
    if (selectedQty > available) return alert(`Saldo insuficiente! Apenas ${available} disponíveis.`);
    setCart([...cart, { ...itemObj, requestQty: selectedQty }]);
    setSelectedItem(""); setSelectedQty(1);
  }

  function removeFromCart(index: number) {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  }

  async function handleFinalizeLoan() {
    if (cart.length === 0) return alert("Adicione itens!");
    if (!borrowerName) return alert("Preencha o nome!");

    const payload = {
      borrowerName,
      department,
      items: cart.map(i => ({ itemId: i.id, quantity: i.requestQty }))
    };

    try {
      const res = await fetch('/api/create-loan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      const resultLoans = await res.json();
      if(resultLoans.error) throw new Error(resultLoans.error);
      
      // === LÓGICA DE IMPRESSÃO DUPLA COM DELAY ===
      await printJob(borrowerName, department, cart, "VIA DO FUNCIONÁRIO");
      
      // Delay de 6 segundos para corte
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      await printJob(borrowerName, department, cart, "VIA DE CONTROLE");
      // ==========================================

      setCart([]); setBorrowerName("");
      await loadData();
      alert("Sucesso!");

    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleReturn(loanId: string) {
    if(!confirm("Confirmar devolução?")) return;
    await returnLoan(loanId);
    await loadData();
    router.refresh();
  }

  function printJob(name: string, dept: string, itemsList: any[], type: string) {
    return new Promise<void>((resolve) => {
      const content = `
        <html>
          <head>
            <style>
              @page { margin: 0; size: 80mm auto; }
              
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                margin: 0; 
                padding: 2mm 4mm; /* Margens laterais seguras */
                width: 72mm; 
                color: #000 !important; /* FORÇA PRETO PURO */
              }

              .header { 
                text-align: center; 
                border-bottom: 3px solid #000; 
                padding-bottom: 5px; 
                margin-bottom: 10px; 
              }
              
              /* Títulos Grandes e Pretos */
              .logo { font-size: 26px; font-weight: 900; display: block; letter-spacing: -1px; }
              .sub-logo { font-size: 11px; font-weight: 800; text-transform: uppercase; display: block; }
              
              /* Caixa preta para destacar o tipo de via */
              .doc-box { 
                margin-top: 8px;
                border: 2px solid #000;
                font-size: 12px; 
                font-weight: 900; 
                padding: 4px; 
                text-align: center;
                text-transform: uppercase;
                background: #fff; /* Fundo branco para contraste */
              }

              .row { margin-bottom: 8px; }
              
              /* Rótulos em Negrito Preto */
              .label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #000; }
              
              /* Valores Grandes */
              .value { 
                font-size: 16px; 
                font-weight: 600; 
                border-bottom: 2px solid #000; /* Linha grossa */
                display: block; 
                width: 100%; 
                line-height: 1.2;
              }

              /* Tabela de Itens */
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { border-bottom: 2px solid #000; text-align: left; font-size: 10px; font-weight: 900; }
              td { padding: 6px 0; font-size: 14px; font-weight: 700; border-bottom: 1px dashed #000; }
              
              .qty-col { width: 35px; text-align: center; font-size: 16px; }

              .footer { text-align: center; margin-top: 25px; }
              .signature { border-top: 2px solid #000; width: 100%; padding-top: 5px; font-size: 10px; font-weight: 800; }
              .timestamp { font-size: 10px; font-weight: 600; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <span class="logo">UNASP</span>
              <span class="sub-logo">Controle de Ferramentas</span>
              <div class="doc-box">${type}</div>
            </div>
            
            <div class="row">
              <div class="label">Funcionário</div>
              <div class="value">${name.toUpperCase()}</div>
            </div>

            <div class="row">
              <div class="label">Departamento</div>
              <div class="value">${dept.toUpperCase()}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="qty-col">QTD</th>
                  <th>DESCRIÇÃO DO ITEM</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList.map(i => `
                  <tr>
                    <td class="qty-col">${i.requestQty}</td>
                    <td>${i.name.toUpperCase()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <div class="signature">ASSINATURA RESPONSÁVEL</div>
              <div class="timestamp">${new Date().toLocaleString('pt-BR')}</div>
            </div>
          </body>
        </html>
      `;

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.write(content);
        doc.close();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }
      setTimeout(() => { 
        if(document.body.contains(iframe)) document.body.removeChild(iframe); 
        resolve(); 
      }, 1000);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="bg-warning/10 p-2 rounded-lg text-warning border border-warning/20">📝</span> 
          Registrar Empréstimo
        </h1>
        <Button onClick={loadData} variant="outline" size="sm" className="text-muted-foreground border-border bg-transparent hover:bg-muted/10">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-surface shadow-lg">
          <CardHeader className="border-b border-border pb-4"><CardTitle className="text-lg font-medium text-white">Dados da Retirada</CardTitle></CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Funcionário</label>
                <Input value={borrowerName} onChange={e => setBorrowerName(e.target.value)} placeholder="Nome Completo" className="bg-surface border-input text-foreground" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Setor</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-surface border-input text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border text-foreground">
                    {['Elétrica','Hidráulica','Serralheria','Marmoraria','Construção','Refrigeração','Pintura'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Ferramenta</label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger className="bg-background border-input text-foreground h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-surface border-border text-foreground">
                    {items.map((i: any) => {
                      const disp = i.quantity - (i.loans?.reduce((a:any,b:any)=>a+b.quantity,0)||0);
                      return <SelectItem key={i.id} value={i.id} disabled={disp<=0}>{i.name} (Disp: {disp})</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Qtd</label>
                <Input type="number" value={selectedQty} onChange={e => setSelectedQty(Number(e.target.value))} min="1" className="bg-background border-input text-foreground h-12 text-center font-bold" />
              </div>
              <Button onClick={addToCart} className="h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-6"><Plus className="mr-2 h-5 w-5"/> Adicionar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-lg flex flex-col">
          <CardHeader className="border-b border-border pb-4 bg-muted/20"><CardTitle className="text-lg font-medium text-white flex items-center gap-2"><ShoppingCart className="text-warning"/> Lista</CardTitle></CardHeader>
          <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
            {cart.length === 0 ? <div className="text-center text-muted-foreground py-10 opacity-50">Lista vazia.</div> : 
              <ul className="space-y-2">{cart.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 bg-background rounded-md border border-border">
                  <div><div className="font-bold text-white">{item.requestQty}x {item.name}</div><div className="text-xs text-muted-foreground">{item.category}</div></div>
                  <button onClick={() => removeFromCart(idx)} className="text-destructive hover:text-red-400 p-2"><Trash2 size={18}/></button>
                </li>))}</ul>
            }
          </div>
          <div className="p-4 border-t border-border bg-muted/20">
            <Button onClick={handleFinalizeLoan} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-lg shadow-primary/10"><Printer className="mr-2 h-5 w-5"/> FINALIZAR</Button>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-lg overflow-hidden mt-8">
        <Table>
          <TableHeader className="bg-muted/50"><TableRow className="border-border hover:bg-transparent"><TableHead className="text-primary font-bold">Data</TableHead><TableHead className="text-primary font-bold">Nome</TableHead><TableHead className="text-primary font-bold">Setor</TableHead><TableHead className="text-primary font-bold">Item</TableHead><TableHead className="text-primary font-bold text-center">Ação</TableHead></TableRow></TableHeader>
          <TableBody>
            {loans.filter((l:any) => l.status === 'EMPRESTADO').map((loan: any) => (
              <TableRow key={loan.id} className="border-border hover:bg-muted/20">
                <TableCell className="text-muted-foreground">{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium text-white">{loan.borrowerName}</TableCell>
                <TableCell className="text-muted-foreground">{loan.department}</TableCell>
                <TableCell><span className="text-warning font-bold">{loan.quantity}x</span> <span className="text-foreground">{loan.item.name}</span></TableCell>
                <TableCell className="text-center"><Button size="sm" variant="outline" onClick={() => handleReturn(loan.id)} className="border-success/30 text-success hover:bg-success/10 hover:text-success bg-transparent"><CheckCircle2 className="mr-2 h-4 w-4"/> Devolver</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}