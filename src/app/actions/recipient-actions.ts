'use server'

import { prisma } from "@/lib/prisma/prisma"
import { revalidatePath } from "next/cache"

export type RecipientData = {
  name: string
  walletAddress: string
  email?: string
  country?: string
  note?: string
  isFavorite?: boolean
}

// --- RÉCUPÉRER ---
export async function getRecipients(userId: string) {
  if (!userId) return []
  try {
    return await prisma.recipient.findMany({
      where: { userId },
      orderBy: [
        { isFavorite: 'desc' }, // Favoris en premier
        { name: 'asc' }         // Puis par ordre alphabétique
      ]
    })
  } catch (error) {
    console.error("Erreur getRecipients:", error)
    return []
  }
}

// --- AJOUTER ---
export async function addRecipient(userId: string, data: RecipientData) {
  if (!userId) throw new Error("Non autorisé")
  
  try {
    const recipient = await prisma.recipient.create({
      data: {
        ...data,
        userId
      }
    })
    revalidatePath('/recipients')
    return { success: true, data: recipient }
  } catch (error) {
    return { success: false, error: "Erreur lors de l'ajout" }
  }
}

// --- MODIFIER ---
export async function updateRecipient(userId: string, recipientId: string, data: Partial<RecipientData>) {
  try {
    await prisma.recipient.update({
      where: { id: recipientId, userId }, // Sécurité: vérifie que ça appartient au user
      data
    })
    revalidatePath('/recipients')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Erreur lors de la modification" }
  }
}

// --- SUPPRIMER ---
export async function deleteRecipient(userId: string, recipientId: string) {
  try {
    await prisma.recipient.delete({
      where: { id: recipientId, userId }
    })
    revalidatePath('/recipients')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// --- BASCULER FAVORI ---
export async function toggleFavoriteRecipient(userId: string, recipientId: string, isFavorite: boolean) {
  return updateRecipient(userId, recipientId, { isFavorite })
}