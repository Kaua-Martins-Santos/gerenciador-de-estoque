'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FileDown, Search, Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [reportType, setReportType] = useState("inventory");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    const query = `/api/reports?type=${reportType}&start=${startDate}&end=${endDate}`;
    try {
      const res = await fetch(query);
      const json = await res.json();
      setData(json);
    } catch (error) {
      alert("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'), 
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        return typeof val === 'string' ? `"${val}"` : val;
      }).join(';'))
    ].join('\r\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_UNASP_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">📈 Central de Relatórios</h1>
      </div>
      
      {/* Barra de Filtros */}
      <Card className="p-6 bg-surface border-border shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Tipo de Relatório</label>
            <Select onValueChange={setReportType} defaultValue="inventory">
              <SelectTrigger className="bg-background border-input text-foreground h-10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-surface border-border text-foreground">
                <SelectItem value="inventory">📦 Inventário Geral (Tudo)</SelectItem>
                <SelectItem value="low_stock">🚨 Estoque Crítico</SelectItem>
                <SelectItem value="transactions">↔️ Movimentações de Consumo</SelectItem>
                <SelectItem value="loans_history">📝 Histórico de Empréstimos</SelectItem>
                <SelectItem value="purchases">🛒 Detalhe de Compras</SelectItem>
                <SelectItem value="spending_dept">💰 Gastos por Departamento</SelectItem>
                <SelectItem value="repairs_stats">🔧 Relatório de Reparos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Início</label>
            <Input type="date" className="bg-background border-input text-foreground h-10 block" onChange={e => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Fim</label>
            <Input type="date" className="bg-background border-input text-foreground h-10 block" onChange={e => setEndDate(e.target.value)} />
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading} 
            className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-10"
          >
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2 h-4 w-4"/>}
            Gerar
          </Button>

        </div>
      </Card>

      {data.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={downloadCSV} variant="outline" className="border-success/30 text-success hover:bg-success/10 bg-transparent">
            <FileDown className="mr-2 h-4 w-4" />
            Baixar Excel (CSV)
          </Button>
        </div>
      )}

      {/* Tabela de Resultados */}
      <div className="border border-border rounded-lg bg-surface shadow-lg overflow-hidden">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  {Object.keys(data[0]).map((head) => (
                    <TableHead key={head} className="font-bold text-primary whitespace-nowrap uppercase text-xs">{head.replace(/_/g, ' ')}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/20 border-border">
                    {Object.values(row).map((val: any, idx) => (
                      <TableCell key={idx} className="whitespace-nowrap text-foreground">
                        {val}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center border border-dashed border-border m-4 rounded-lg bg-background/50">
            <Search className="h-12 w-12 mb-4 opacity-20" />
            <p>Selecione um filtro acima e clique em "Gerar" para visualizar os dados.</p>
          </div>
        )}
      </div>
    </div>
  );
}