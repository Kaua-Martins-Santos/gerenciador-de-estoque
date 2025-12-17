import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Cria a senha criptografada (123456)
    const passwordHash = await bcrypt.hash('123456', 10);

    // 2. Cria o usuário Admin no banco (ou reseta a senha se ele já existir)
    const user = await prisma.user.upsert({
      where: { email: 'admin@unasp.br' },
      update: {
        password: passwordHash, // Reseta a senha para 123456 caso você esqueça
        role: 'ADMIN'
      },
      create: {
        email: 'admin@unasp.br',
        name: 'Administrador',
        password: passwordHash,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "✅ Admin criado/atualizado com sucesso!",
      login: "admin@unasp.br",
      senha: "123456"
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "❌ Erro ao criar admin.", 
      details: error.message,
      dica: "O comando 'npx prisma db push' rodou no servidor? A tabela User existe?"
    }, { status: 500 });
  }
}