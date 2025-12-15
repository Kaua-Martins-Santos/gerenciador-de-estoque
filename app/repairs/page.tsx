import { prisma } from "@/lib/db";
import { addRepairOrder, updateRepairStatus, deleteRepair } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Wrench, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RepairsPage() {
  const repairs = await prisma.repairOrder.findMany({ 
    orderBy: [
      { status: 'asc' }, 
      { dataEntrada: 'desc' }
    ] 
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Wrench className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold text-white">Central de Reparos</h1>
      </div>
      
      {/* FORMULÁRIO DE ENTRADA DE REPARO */}
      <Card className="bg-surface border-border shadow-lg">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-lg text-white">Nova Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={addRepairOrder} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Item / Equipamento</label>
              <Input name="item" required className="bg-background border-input text-white" placeholder="Ex: Cadeira Giratória" />
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Defeito Relatado</label>
              <Input name="problema" required className="bg-background border-input text-white" placeholder="Ex: Roda Quebrada / Não liga" />
            </div>
            
            {/* AGORA É TEXTO LIVRE */}
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</label>
              <Input name="departamento" required className="bg-background border-input text-white" placeholder="Ex: Financeiro" />
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Solicitante</label>
              <Input name="solicitante" required className="bg-background border-input text-white" />
            </div>

            {/* PRIORIDADE REMOVIDA DAQUI */}

            <div className="md:col-span-9">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Observações Técnicas</label>
              <Input name="observacao" className="bg-background border-input text-white" placeholder="Detalhes adicionais..." />
            </div>

            <div className="md:col-span-3">
              {/* BOTÃO ROXO (PRIMARY) AGORA */}
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                <Wrench className="mr-2 h-4 w-4"/> Abrir Ordem
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* TABELA DE REPAROS */}
      <div className="border border-border rounded-xl bg-surface shadow-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary font-bold">Entrada</TableHead>
                <TableHead className="text-primary font-bold">Item</TableHead>
                <TableHead className="text-primary font-bold">Defeito</TableHead>
                <TableHead className="text-primary font-bold">Origem</TableHead>
                {/* COLUNA PRIORIDADE REMOVIDA */}
                <TableHead className="text-primary font-bold text-center">Status Atual</TableHead>
                <TableHead className="text-primary font-bold text-center">Ação Rápida</TableHead>
                <TableHead className="text-right text-primary font-bold">X</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((r) => (
                <TableRow key={r.id} className={`border-border hover:bg-white/5 transition-colors ${r.status === 'Concluído' ? 'opacity-50 grayscale' : ''}`}>
                  <TableCell className="font-mono text-muted-foreground">{new Date(r.dataEntrada).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium text-white">{r.item}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate" title={r.problema}>{r.problema}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white text-xs">{r.departamento}</span>
                      <span className="text-[10px] text-muted-foreground">{r.solicitante}</span>
                    </div>
                  </TableCell>
                  
                  {/* CÉLULA PRIORIDADE REMOVIDA */}

                  <TableCell className="text-center">
                    <Badge className={`
                      ${r.status === 'Aguardando' ? 'bg-zinc-500' : 
                        r.status === 'Em Andamento' ? 'bg-blue-600' : 
                        r.status === 'Aguardando Peça' ? 'bg-orange-500' : 
                        'bg-green-600'}
                    `}>
                      {r.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {r.status !== 'Concluído' ? (
                      <div className="flex gap-1 justify-center">
                        <form action={updateRepairStatus.bind(null, r.id, 'Em Andamento')}>
                          <button title="Iniciar" className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400"><Wrench size={16}/></button>
                        </form>
                        <form action={updateRepairStatus.bind(null, r.id, 'Aguardando Peça')}>
                          <button title="Aguardar Peça" className="p-1.5 hover:bg-orange-500/20 rounded text-orange-400"><Clock size={16}/></button>
                        </form>
                        <form action={updateRepairStatus.bind(null, r.id, 'Concluído')}>
                          <button title="Concluir" className="p-1.5 hover:bg-green-500/20 rounded text-green-400"><CheckCircle2 size={16}/></button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-success">Entregue em {r.dataSaida?.toLocaleDateString('pt-BR')}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <form action={deleteRepair.bind(null, r.id)}>
                      <button className="text-destructive hover:text-red-400 transition-colors p-2 hover:bg-destructive/10 rounded">
                        <Trash2 size={16}/>
                      </button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}