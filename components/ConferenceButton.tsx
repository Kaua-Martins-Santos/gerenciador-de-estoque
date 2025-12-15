'use client'

import { ClipboardList } from "lucide-react";

export function ConferenceButton({ items }: { items: any[] }) {
  
  function handlePrint() {
    const content = `
      <html>
        <head>
          <title>Conferência de Estoque - UNASP</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            
            body { 
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 11px; 
              color: #1a1a1a; 
              padding: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
            }
            
            h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            p.subtitle { margin: 5px 0 0 0; font-size: 12px; color: #555; }

            .info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-weight: 600;
              font-size: 13px;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 4px;
              background: #f9f9f9;
            }

            table { width: 100%; border-collapse: collapse; }
            
            th { 
              background-color: #eee; 
              border: 1px solid #999; 
              padding: 8px; 
              text-align: left; 
              font-weight: 800;
              text-transform: uppercase;
              font-size: 10px;
            }
            
            td { 
              border: 1px solid #ccc; 
              padding: 6px 8px; 
              vertical-align: middle;
            }

            .check { width: 40px; text-align: center; }
            .check-box { width: 15px; height: 15px; border: 1px solid #333; display: inline-block; }
            
            .qty { width: 80px; text-align: center; font-weight: bold; }
            .real { width: 100px; }
            
            tr:nth-child(even) { background-color: #fcfcfc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Conferência</h1>
            <p class="subtitle">UNASP - Engenheiro Coelho | Departamento de Manutenção</p>
          </div>

          <div class="info">
            <span>DATA: ${new Date().toLocaleDateString('pt-BR')}</span>
            <span>RESPONSÁVEL: ___________________________________</span>
          </div>

          <table>
            <thead>
              <tr>
                <th class="check">OK</th>
                <th>ITEM</th>
                <th>CATEGORIA</th>
                <th class="qty">SISTEMA</th>
                <th class="real">CONTAGEM REAL</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((i: any) => `
                <tr>
                  <td class="check"><span class="check-box"></span></td>
                  <td>${i.name}</td>
                  <td>${i.category}</td>
                  <td class="qty">${i.currentStock !== undefined ? i.currentStock : i.quantity}</td>
                  <td class="real"></td>
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