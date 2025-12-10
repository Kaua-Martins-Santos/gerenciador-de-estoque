// app/actions/inventory.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// === 1. CONSUMÍVEIS ===
export async function addConsumable(formData: FormData) {
  await prisma.consumableItem.create({
    data: {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      minQuantity: Number(formData.get('minQuantity')),
      currentStock: 0
    }
  })
  revalidatePath('/consumables')
}

// === 2. FERRAMENTAS (SIMPLIFICADO) ===
export async function addAsset(formData: FormData) {
  await prisma.permanentItem.create({
    data: { 
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity'))
    }
  })
  revalidatePath('/assets')
}

// === 3. EMPRÉSTIMOS (REGISTRAR E BAIXAR) ===
export async function registerLoan(formData: FormData) {
  const itemId = formData.get('itemId') as string
  const quantity = Number(formData.get('quantity'))

  // 1. Verifica se tem saldo
  const item = await prisma.permanentItem.findUnique({ where: { id: itemId }, include: { loans: true } })
  if (!item) throw new Error("Item não encontrado")
  
  const totalEmprestado = item.loans
    .filter(l => l.status === 'EMPRESTADO')
    .reduce((acc, l) => acc + l.quantity, 0)

  const saldoDisponivel = item.quantity - totalEmprestado

  if (quantity > saldoDisponivel) {
    throw new Error(`Saldo insuficiente! Disponível: ${saldoDisponivel}`)
  }

  // 2. Cria o empréstimo
  const loan = await prisma.loan.create({
    data: {
      itemId,
      borrowerName: formData.get('borrowerName') as string,
      department: formData.get('department') as string,
      quantity: quantity,
      status: 'EMPRESTADO'
    },
    include: { item: true } // Retorna o item para podermos imprimir o nome
  })
  
  revalidatePath('/loans')
  revalidatePath('/assets')
  return loan // Retorna os dados para o frontend imprimir
}

export async function returnLoan(loanId: string) {
  await prisma.loan.update({
    where: { id: loanId },
    data: { status: 'DEVOLVIDO', returnDate: new Date() }
  })
  revalidatePath('/loans')
}

// === 4. COMPRAS (PLANILHA ANTIGA) ===
export async function addPurchaseRequest(formData: FormData) {
  await prisma.purchaseRequest.create({
    data: {
      solicitante: formData.get('solicitante') as string,
      departamento: formData.get('departamento') as string,
      descricao: formData.get('descricao') as string,
      quantidade: formData.get('quantidade') as string,
      prioridade: formData.get('prioridade') as string,
      observacao: formData.get('observacao') as string,
    }
  })
  revalidatePath('/shopping')
}

export async function togglePurchaseStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'PENDENTE' ? 'COMPRADO' : 'PENDENTE';
  await prisma.purchaseRequest.update({ where: { id }, data: { status: newStatus } })
  revalidatePath('/shopping')
}

export async function deletePurchase(id: string) {
  await prisma.purchaseRequest.delete({ where: { id } })
  revalidatePath('/shopping')
}