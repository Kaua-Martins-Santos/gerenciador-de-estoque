'use client'

import { ClipboardList } from "lucide-react";

export function ConferenceButton({ items }: { items: any[] }) {
  
  function handlePrint() {
    const content = `
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; font-size: 12px; color: black; }
            h2 { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid black; padding: 5px; text-align: left; }
            th { background-color: #f0f0f0; }
            .check { width: 30px; text-align: center; }
            .qty { width: 60px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>CONFERÊNCIA DE ESTOQUE</h2>
          <p><strong>DATA:</strong> ${new Date().toLocaleDateString('pt-BR')} &nbsp;&nbsp; <strong>RESPONSÁVEL:</strong> _________________</p>
          <table>
            <thead>
              <tr>
                <th class="check">OK</th>
                <th>ITEM</th>
                <th>CATEGORIA</th>
                <th class="qty">SISTEMA</th>
                <th>CONTAGEM REAL</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((i: any) => `
                <tr>
                  <td class="check"> </td>
                  <td>${i.name}</td>
                  <td>${i.category}</td>
                  <td class="qty">${i.currentStock !== undefined ? i.currentStock : i.quantity}</td>
                  <td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

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
    <button onClick={handlePrint} className="w-full text-left">
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer group">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 group-hover:scale-105 transition-transform">
          <ClipboardList size={16}/> Conferência Mensal
        </div>
        <p className="text-sm text-white/80">Clique aqui para imprimir o checklist.</p>
      </div>
    </button>
  )
}