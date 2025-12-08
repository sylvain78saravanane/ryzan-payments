'use server'

import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"

export interface CreateTransactionInput {
  userId: string
  amount: number
  currency: string
  toAddress: string
  txHash: string
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL"
  status?: "PENDING" | "COMPLETED" | "FAILED"
  recipientName?: string
  recipientCountry?: string
  exchangeRate?: number
  receivedAmount?: number
  receivedCurrency?: string
  networkFee?: number
}

export interface TransactionRecord {
  id: string
  createdAt: Date
  amount: number
  currency: string
  status: string
  type: string
  toAddress: string
  txHash: string | null
  userId: string
}

export async function createTransaction(input: CreateTransactionInput): Promise<{
  success: boolean
  transaction?: TransactionRecord
  error?: string
}> {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        currency: input.currency,
        toAddress: input.toAddress,
        txHash: input.txHash,
        type: input.type,
        status: input.status || "COMPLETED",
      }
    })

    revalidatePath('/transactions')
    revalidatePath('/dashboard')

    return { success: true, transaction }
  } catch (error: any) {
    console.error("Erreur création transaction:", error)
    return { success: false, error: error.message || "Erreur inconnue" }
  }
}

export async function updateTransactionStatus(
  txId: string, 
  status: "PENDING" | "COMPLETED" | "FAILED",
  txHash?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.transaction.update({
      where: { id: txId },
      data: { 
        status,
        ...(txHash && { txHash })
      }
    })

    revalidatePath('/transactions')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserTransactions(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    type?: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL"
    status?: "PENDING" | "COMPLETED" | "FAILED"
  }
): Promise<TransactionRecord[]> {
  if (!userId) return []

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(options?.type && { type: options.type }),
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    })

    return transactions
  } catch (error) {
    console.error("Erreur récupération transactions:", error)
    return []
  }
}

export async function getTransactionStats(userId: string): Promise<{
  totalSent: number
  totalReceived: number
  totalTransactions: number
  pendingCount: number
  thisMonthVolume: number
}> {
  if (!userId) {
    return {
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: 0,
      pendingCount: 0,
      thisMonthVolume: 0
    }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const stats = transactions.reduce((acc, tx) => {
      if (tx.type === "TRANSFER" || tx.type === "WITHDRAWAL") {
        acc.totalSent += tx.amount
      } else if (tx.type === "DEPOSIT") {
        acc.totalReceived += tx.amount
      }

      if (tx.status === "PENDING") {
        acc.pendingCount++
      }

      if (tx.createdAt >= startOfMonth) {
        acc.thisMonthVolume += tx.amount
      }

      return acc
    }, {
      totalSent: 0,
      totalReceived: 0,
      pendingCount: 0,
      thisMonthVolume: 0
    })

    return {
      ...stats,
      totalTransactions: transactions.length
    }
  } catch (error) {
    console.error("Erreur stats transactions:", error)
    return {
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: 0,
      pendingCount: 0,
      thisMonthVolume: 0
    }
  }
}

export async function getTransactionByHash(
  txHash: string
): Promise<TransactionRecord | null> {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { txHash }
    })
    return transaction
  } catch (error) {
    console.error("Erreur recherche transaction:", error)
    return null
  }
}

export async function getRecentTransactions(
  userId: string,
  limit: number = 5
): Promise<TransactionRecord[]> {
  return getUserTransactions(userId, { limit })
}

export async function transactionExists(txHash: string): Promise<boolean> {
  try {
    const count = await prisma.transaction.count({
      where: { txHash }
    })
    return count > 0
  } catch {
    return false
  }
}