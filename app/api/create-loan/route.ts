import { registerBatchLoan } from "@/app/actions/inventory";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Agora esperamos um JSON com { borrowerName, department, items: [] }
    const data = await req.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("Nenhum item selecionado para empréstimo.");
    }

    const loans = await registerBatchLoan(data);
    return NextResponse.json(loans);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}