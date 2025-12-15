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

// === 2. FERRAMENTAS ===
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

// === 3. EMPRÉSTIMOS ===
export async function registerBatchLoan(data: { borrowerName: string, department: string, items: { itemId: string, quantity: number }[] }) {
  const result = await prisma.$transaction(async (tx) => {
    const createdLoans = [];
    for (const itemRequest of data.items) {
      const item = await tx.permanentItem.findUnique({ where: { id: itemRequest.itemId }, include: { loans: true } });
      if (!item) throw new Error(`Item não encontrado: ${itemRequest.itemId}`);

      const totalEmprestado = item.loans
        .filter(l => l.status === 'EMPRESTADO')
        .reduce((acc, l) => acc + l.quantity, 0);

      const saldoDisponivel = item.quantity - totalEmprestado;

      if (itemRequest.quantity > saldoDisponivel) {
        throw new Error(`Saldo insuficiente para ${item.name}! Disp: ${saldoDisponivel}`);
      }

      const loan = await tx.loan.create({
        data: {
          itemId: itemRequest.itemId,
          borrowerName: data.borrowerName,
          department: data.department,
          quantity: itemRequest.quantity,
          status: 'EMPRESTADO'
        },
        include: { item: true }
      });
      createdLoans.push(loan);
    }
    return createdLoans;
  });
  revalidatePath('/loans');
  revalidatePath('/assets');
  return result;
}

export async function returnLoan(loanId: string) {
  await prisma.loan.update({
    where: { id: loanId },
    data: { status: 'DEVOLVIDO', returnDate: new Date() }
  })
  revalidatePath('/loans')
}

// === 4. COMPRAS ===
export async function addPurchaseRequest(formData: FormData) {
  const valorRaw = formData.get('valorUnitario') as string;
  const valorUnitario = valorRaw ? parseFloat(valorRaw.replace(',', '.')) : 0;

  await prisma.purchaseRequest.create({
    data: {
      solicitante: formData.get('solicitante') as string,
      departamento: formData.get('departamento') as string,
      descricao: formData.get('descricao') as string,
      quantidade: formData.get('quantidade') as string,
      unidade: formData.get('unidade') as string,
      justificativa: formData.get('justificativa') as string,
      prioridade: formData.get('prioridade') as string,
      valorUnitario: valorUnitario,
      observacao: formData.get('observacao') as string,
      status: 'Solicitado'
    }
  })
  revalidatePath('/shopping')
}

export async function togglePurchaseStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'Solicitado' ? 'Aprovado' : (currentStatus === 'Aprovado' ? 'Comprado' : (currentStatus === 'Comprado' ? 'Entregue' : 'Solicitado'));
  await prisma.purchaseRequest.update({ where: { id }, data: { status: newStatus } })
  revalidatePath('/shopping')
}

export async function deletePurchase(id: string) {
  await prisma.purchaseRequest.delete({ where: { id } })
  revalidatePath('/shopping')
}

// === 5. REPAROS (ATUALIZADO) ===
export async function addRepairOrder(formData: FormData) {
  await prisma.repairOrder.create({
    data: {
      item: formData.get('item') as string,
      problema: formData.get('problema') as string,
      departamento: formData.get('departamento') as string, // Agora pega do Input
      solicitante: formData.get('solicitante') as string,
      observacao: formData.get('observacao') as string,
      status: 'Aguardando'
      // Prioridade removida
    }
  })
  revalidatePath('/repairs')
}

export async function updateRepairStatus(id: string, newStatus: string) {
  const data: any = { status: newStatus };
  if (newStatus === 'Concluído') data.dataSaida = new Date();
  await prisma.repairOrder.update({ where: { id }, data })
  revalidatePath('/repairs')
}

export async function deleteRepair(id: string) {
  await prisma.repairOrder.delete({ where: { id } })
  revalidatePath('/repairs')
}