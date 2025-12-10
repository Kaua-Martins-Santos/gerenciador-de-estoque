import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.permanentItem.findMany({ include: { loans: { where: { status: 'EMPRESTADO'} } } });
  const loans = await prisma.loan.findMany({ orderBy: { loanDate: 'desc' }, include: { item: true } });
  return NextResponse.json({ items, loans });
}