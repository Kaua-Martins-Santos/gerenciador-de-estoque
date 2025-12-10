// app/reports/page.tsx
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
    // Chama a nossa API nova
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
    
    // Pega os cabeçalhos dinamicamente
    const headers = Object.keys(data[0]);
    
    // Cria CSV com suporte a acentos (BOM \ufeff)
    const csvContent = [
      headers.join(';'), 
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        return typeof val === 'string' ? `"${val}"` : val; // Protege textos com aspas
      }).join(';'))
    ].join('\r\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_UNASP_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800">📈 Central de Relatórios</h1>
      </div>
      
      {/* Barra de Filtros */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1 block">TIPO DE RELATÓRIO</label>
            <Select onValueChange={setReportType} defaultValue="inventory">
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">📦 Inventário Geral (Tudo)</SelectItem>
                <SelectItem value="low_stock">🚨 Estoque Baixo / Crítico</SelectItem>
                <SelectItem value="transactions">arrows_left_right Movimentações de Consumo</SelectItem>
                <SelectItem value="loans_history">📝 Histórico de Empréstimos</SelectItem>
                <SelectItem value="ranking">🏆 Ranking (Mais Usados)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">DATA INÍCIO</label>
            <Input type="date" className="bg-white" onChange={e => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">DATA FIM</label>
            <Input type="date" className="bg-white" onChange={e => setEndDate(e.target.value)} />
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading} 
            className="bg-[#cba6f7] text-[#181825] font-bold hover:bg-[#b4befe]"
          >
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2 h-4 w-4"/>}
            Gerar
          </Button>

        </div>
      </Card>

      {/* Botão de Download (só aparece se tiver dados) */}
      {data.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={downloadCSV} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
            <FileDown className="mr-2 h-4 w-4" />
            Baixar Excel (CSV)
          </Button>
        </div>
      )}

      {/* Tabela de Resultados */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  {Object.keys(data[0]).map((head) => (
                    <TableHead key={head} className="font-bold text-slate-700 whitespace-nowrap">{head}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50">
                    {Object.values(row).map((val: any, idx) => (
                      <TableCell key={idx} className="whitespace-nowrap">
                        {val}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Search className="h-12 w-12 mb-4 opacity-20" />
            <p>Selecione um filtro e clique em "Gerar" para ver os dados.</p>
          </div>
        )}
      </div>
    </div>
  );
}