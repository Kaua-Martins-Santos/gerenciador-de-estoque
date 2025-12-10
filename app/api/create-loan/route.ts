import { registerLoan } from "@/app/actions/inventory";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const loan = await registerLoan(formData);
    return NextResponse.json(loan);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}