'use server'

import { prisma } from "@/lib/prisma/prisma"

export async function getUserTransactions(userId: string) {
  if (!userId) return []

  try {
    // Récupère les transactions liées à l'utilisateur, triées par date
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return transactions
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error)
    return []
  }
}