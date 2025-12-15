import { prisma } from "@/lib/db";
import { addPurchaseRequest, togglePurchaseStatus, deletePurchase } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingCart, PlusCircle, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ShoppingPage() {
  const requests = await prisma.purchaseRequest.findMany({ orderBy: { data: 'desc' } });

  // Formatador de Moeda
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <ShoppingCart className="text-accent h-8 w-8" />
        <h1 className="text-3xl font-bold text-white">Controle de Solicitações</h1>
      </div>
      
      {/* --- FORMULÁRIO COMPLETO --- */}
      <Card className="bg-surface border-border shadow-lg">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-lg text-white">Nova Requisição</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={addPurchaseRequest} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Linha 1 */}
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Solicitante</label>
              <Input name="solicitante" required className="bg-background border-input text-white" placeholder="Seu nome..." />
            </div>
            
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</label>
              <Select name="departamento" defaultValue="Manutenção">
                <SelectTrigger className="bg-background border-input text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface border-border text-white">
                  <SelectItem value="Residencial Feminino">Residencial Feminino</SelectItem>
                  <SelectItem value="Residencial Masculino">Residencial Masculino</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Cozinha">Cozinha</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição do Item</label>
              <Input name="descricao" required className="bg-background border-input text-white" placeholder="Ex: Frigobar Electrolux..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Prioridade</label>
              <Select name="prioridade" defaultValue="B">
                <SelectTrigger className="bg-background border-input text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface border-border text-white">
                  <SelectItem value="A">A - Urgente</SelectItem>
                  <SelectItem value="B">B - Normal</SelectItem>
                  <SelectItem value="C">C - Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linha 2 */}
            <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Qtd</label>
              <Input name="quantidade" type="number" required className="bg-background border-input text-white" placeholder="1" />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Unid.</label>
              <Input name="unidade" className="bg-background border-input text-white" placeholder="Cx, Un" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor Unit. (R$)</label>
              <Input name="valorUnitario" type="number" step="0.01" className="bg-background border-input text-white" placeholder="0.00" />
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Justificativa / Finalidade</label>
              <Input name="justificativa" className="bg-background border-input text-white" placeholder="Ex: Troca do frigobar queimado..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Observação</label>
              <Input name="observacao" className="bg-background border-input text-white" />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4"/> Adicionar
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* --- TABELA ESTENDIDA (Igual à planilha) --- */}
      <div className="border border-border rounded-xl bg-surface shadow-lg overflow-hidden flex flex-col">
        {/* Adicionei 'overflow-x-auto' para permitir rolagem horizontal como no Excel */}
        <div className="overflow-x-auto">
          <Table className="min-w-[1400px]"> 
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary font-bold whitespace-nowrap w-[100px]">Nº Req</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Data Solicit.</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Solicitante</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Departamento</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap min-w-[250px]">Descrição do Item</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap text-center">Qtd</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap text-center">Unid</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Valor Unit.</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Valor Total</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap text-center">Prioridade</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap text-center">Status</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Entrega</TableHead>
                <TableHead className="text-primary font-bold whitespace-nowrap">Responsável</TableHead>
                <TableHead className="text-right text-primary font-bold w-[50px]">X</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                // Cálculo automático do Valor Total
                const qtdNum = parseFloat(req.quantidade) || 0;
                const total = (req.valorUnitario || 0) * qtdNum;

                return (
                  <TableRow key={req.id} className="border-border hover:bg-white/5 transition-colors text-xs">
                    <TableCell className="font-mono text-muted-foreground">{req.id.slice(0, 5).toUpperCase()}</TableCell>
                    <TableCell>{new Date(req.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium text-white">{req.solicitante}</TableCell>
                    <TableCell>{req.departamento}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{req.descricao}</span>
                        {req.justificativa && <span className="text-[10px] text-muted-foreground italic">{req.justificativa}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-white">{req.quantidade}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{req.unidade || '-'}</TableCell>
                    <TableCell>{formatCurrency(req.valorUnitario || 0)}</TableCell>
                    <TableCell className="font-bold text-success">{formatCurrency(total)}</TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`
                        ${req.prioridade === 'A' ? 'border-red-500 text-red-500 bg-red-500/10' : 
                          req.prioridade === 'B' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 
                          'border-blue-500 text-blue-500 bg-blue-500/10'}
                      `}>
                        {req.prioridade}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <form action={togglePurchaseStatus.bind(null, req.id, req.status)}>
                        <button className={`
                          font-bold text-[10px] px-3 py-1 rounded border uppercase transition-all
                          ${req.status === 'Entregue' 
                            ? 'text-green-400 border-green-500/50 bg-green-500/10 hover:bg-green-500/20' 
                            : 'text-orange-400 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20'}
                        `}>
                          {req.status}
                        </button>
                      </form>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {req.dataEntrega ? new Date(req.dataEntrega).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>{req.responsavel || '-'}</TableCell>

                    <TableCell className="text-right">
                      <form action={deletePurchase.bind(null, req.id)}>
                        <button className="text-destructive hover:text-red-400 transition-colors p-2 hover:bg-destructive/10 rounded">
                          <Trash2 size={16}/>
                        </button>
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}