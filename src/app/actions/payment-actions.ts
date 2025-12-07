'use server'

import { prisma } from "@/lib/prisma/prisma"

// Cette fonction permet de trouver l'adresse wallet via le numéro de téléphone
export async function resolveRecipientByPhone(phone: string) {
  try {
    // 1. On cherche l'utilisateur avec ce numéro
    const recipient = await prisma.user.findUnique({
      where: { phoneNumber: phone },
      select: { 
        walletAddress: true, 
        firstName: true, 
        lastName: true 
      }
    })

    if (!recipient) {
      return { success: false, error: "Utilisateur non trouvé sur Ryzan." }
    }

    if (!recipient.walletAddress) {
      return { success: false, error: "Cet utilisateur n'a pas encore configuré son wallet." }
    }

    // 2. On retourne l'adresse technique (0x...) et le nom pour confirmation
    return { 
      success: true, 
      address: recipient.walletAddress,
      name: `${recipient.firstName} ${recipient.lastName}`
    }

  } catch (error) {
    console.error("Erreur de résolution:", error)
    return { success: false, error: "Erreur technique lors de la recherche." }
  }
}