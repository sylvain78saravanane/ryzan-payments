"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Loader2, Sparkles, Zap, Shield } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"

// Types
type MessageRole = "user" | "agent"

interface ActionButton {
  label: string
  action: string
  variant: "confirm" | "modify" | "cancel"
}

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  actions?: ActionButton[]
  isTyping?: boolean
}

// Suggestions rapides
const quickSuggestions = [
  "Envoie 100€ à Sofia en Inde",
  "Quel est le taux EUR/INR ?",
  "Programme un transfert mensuel",
  "Montre mes transactions",
]

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Bonjour ! 👋 Je suis l'Agent Ryzan, votre assistant IA pour les paiements internationaux.\n\nJe peux vous aider à :\n• 💸 Envoyer de l'argent instantanément\n• 💱 Vérifier les meilleurs taux de change\n• 📅 Automatiser vos transferts récurrents\n• 🔍 Suivre vos transactions\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    await simulateAgentResponse(userMessage.content)
    setIsLoading(false)
  }

  const simulateAgentResponse = async (userInput: string) => {
    const typingId = `typing-${Date.now()}`
    setMessages(prev => [...prev, {
      id: typingId,
      role: "agent",
      content: "",
      timestamp: new Date(),
      isTyping: true
    }])

    await new Promise(resolve => setTimeout(resolve, 1500))

    let response: Partial<Message> = {}

    if (userInput.toLowerCase().includes("envoie") || userInput.toLowerCase().includes("transfert") || userInput.toLowerCase().includes("send")) {
      response = {
        content: "Je prépare votre transfert ! Voici les détails :\n\n💰 **Montant:** 100 USDC (≈ 100€)\n👤 **Destinataire:** Sofia (0x1234...5678)\n📍 **Destination:** Inde\n💱 **Taux:** 1 EUR = 89.70 INR\n💵 **Montant reçu:** ≈ 8,970 INR\n⛽ **Frais:** < $0.01\n⏱️ **Temps estimé:** ~2 secondes\n\nVoulez-vous confirmer ce transfert ?",
        actions: [
          { label: "✓ Confirmer", action: "confirm_transfer", variant: "confirm" },
          { label: "✎ Modifier", action: "modify_transfer", variant: "modify" },
          { label: "✕ Annuler", action: "cancel_transfer", variant: "cancel" }
        ]
      }
    } else if (userInput.toLowerCase().includes("taux") || userInput.toLowerCase().includes("rate") || userInput.toLowerCase().includes("change")) {
      response = {
        content: "📊 **Taux de change en temps réel**\n\n🇪🇺→🇮🇳 **EUR/INR:** 89.70 ↗️ +0.35%\n🇺🇸→🇪🇺 **USD/EUR:** 0.924 ↗️ +0.12%\n🔺 **AVAX/USD:** $36.20 ↘️ -1.2%\n💵 **USDC/EUR:** 0.923 → stable\n\n_Données via API x402 • Coût: $0.001_\n\n✨ **Conseil:** Le taux EUR/INR est actuellement favorable (+0.35% vs hier). C'est un bon moment pour envoyer de l'argent en Inde !",
      }
    } else if (userInput.toLowerCase().includes("programme") || userInput.toLowerCase().includes("automatique") || userInput.toLowerCase().includes("mensuel") || userInput.toLowerCase().includes("récurrent")) {
      response = {
        content: "📅 **Configuration d'un transfert récurrent**\n\nJe peux programmer des envois automatiques avec optimisation intelligente :\n\n• **Fréquence:** Quotidien / Hebdo / Mensuel\n• **Optimisation:** J'analyse les taux et exécute au meilleur moment\n• **Notifications:** Vous êtes alerté avant chaque envoi\n\nPour configurer, dites-moi :\n1. Quel montant ?\n2. Vers qui ?\n3. Quelle fréquence ?",
      }
    } else if (userInput.toLowerCase().includes("transaction") || userInput.toLowerCase().includes("historique") || userInput.toLowerCase().includes("history")) {
      response = {
        content: "📜 **Vos dernières transactions**\n\n1️⃣ **-100 USDC** → Sofia 🇮🇳\n   Il y a 2h • ✅ Terminé\n\n2️⃣ **+500 EURC** ← Marcus 🇬🇧\n   Il y a 5h • ✅ Terminé\n\n3️⃣ **-150 USDC** → Priya 🇮🇳\n   Hier • ✅ Terminé\n\n📊 **Résumé du mois:**\n• Envoyé: 750 USDC\n• Reçu: 500 EURC\n• Économies vs banque: ~45€",
        actions: [
          { label: "📋 Voir tout", action: "view_history", variant: "confirm" },
        ]
      }
    } else if (userInput.toLowerCase().includes("aide") || userInput.toLowerCase().includes("help")) {
      response = {
        content: "🤖 **Voici ce que je peux faire pour vous:**\n\n💸 **Transferts**\n→ \"Envoie 200€ à [nom/adresse]\"\n→ \"Transfert 50 USDC vers 0x...\"\n\n💱 **Taux de change**\n→ \"Quel est le taux EUR/INR ?\"\n→ \"Compare les taux\"\n\n📅 **Automatisation**\n→ \"Programme un envoi mensuel\"\n→ \"Rappelle-moi d'envoyer 100€\"\n\n📊 **Suivi**\n→ \"Montre mes transactions\"\n→ \"Combien j'ai envoyé ce mois ?\"\n\n💡 Astuce: Parlez-moi naturellement, je comprends le contexte !",
      }
    } else {
      response = {
        content: "Je comprends ! 🤔\n\nPour vous aider au mieux, voici quelques exemples de ce que vous pouvez me demander :\n\n• \"Envoie 100€ à Sofia en Inde\"\n• \"Quel est le taux EUR/INR actuel ?\"\n• \"Programme un transfert mensuel\"\n• \"Montre mes dernières transactions\"\n\nN'hésitez pas à me parler naturellement, j'utilise le protocole **x402** pour exécuter vos demandes de manière sécurisée et instantanée ! ⚡",
      }
    }

    setMessages(prev => prev.map(msg => 
      msg.id === typingId 
        ? { ...msg, ...response, isTyping: false }
        : msg
    ))
  }

  const handleAction = async (action: string) => {
    if (action === "confirm_transfer") {
      setIsLoading(true)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: "Je confirme ✓",
        timestamp: new Date(),
      }])

      await new Promise(resolve => setTimeout(resolve, 2000))

      setMessages(prev => [...prev, {
        id: `response-${Date.now()}`,
        role: "agent",
        content: "✅ **Transfert réussi !**\n\n🎉 Votre argent est arrivé !\n\n📝 **Récapitulatif:**\n• Hash: `0xabc123...def456`\n• Montant envoyé: 100 USDC\n• Montant reçu: 8,970 INR\n• Temps: 1.8 secondes\n• Frais totaux: $0.008\n\n📱 Sofia a été notifiée par SMS.\n\n_Notification envoyée via x402 • Coût: $0.01_",
        timestamp: new Date(),
      }])

      setIsLoading(false)
    } else if (action === "cancel_transfer") {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: "Annuler",
        timestamp: new Date(),
      }, {
        id: `response-${Date.now()}`,
        role: "agent",
        content: "Pas de problème, le transfert a été annulé. 👍\n\nN'hésitez pas si vous avez besoin d'autre chose !",
        timestamp: new Date(),
      }])
    } else if (action === "view_history") {
      window.location.href = "/transactions"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <DashboardHeader />

      <div className="h-screen overflow-hidden">
        <main className="flex gap-6 p-6 pt-24 h-full">
          <Sidebar />

          {/* Chat Container */}
          <div className="flex-1 flex flex-col min-w-0 max-h-[calc(100vh-120px)]">
            {/* Agent Header */}
            <div className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-t-2xl border-b border-[#1F1F1F]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl">
                    <Bot className="h-7 w-7 text-purple-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0D0D0D]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    Agent Ryzan
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                      En ligne
                    </span>
                  </h1>
                  <p className="text-sm text-[#919191]">Assistant IA • Paiements x402</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] rounded-full">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-[#919191]">x402</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] rounded-full">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-[#919191]">PayAI</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-red-500 to-orange-400" 
                      : "bg-gradient-to-br from-purple-500/30 to-blue-500/30"
                  }`}>
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-purple-400" />
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex flex-col gap-2 max-w-[75%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}>
                    <div className={`px-5 py-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-md"
                        : "bg-[#151515] text-white rounded-bl-md border border-[#1F1F1F]"
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-[#919191] text-sm">L'agent réfléchit...</span>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content.split('\n').map((line, i) => (
                            <span key={i}>
                              {line.includes('**') ? (
                                <span dangerouslySetInnerHTML={{ 
                                  __html: line
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-black/30 rounded text-purple-300 text-xs">$1</code>')
                                }} />
                              ) : line}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && !message.isTyping && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(action.action)}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                              action.variant === "confirm"
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:scale-105"
                                : action.variant === "modify"
                                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-105"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:scale-105"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-xs text-[#666] px-1">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-6 py-3 bg-[#0A0A0A] border-t border-[#1F1F1F]">
                <p className="text-xs text-[#666] mb-2">💡 Suggestions rapides :</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 text-sm bg-[#1A1A1A] text-[#919191] rounded-xl hover:bg-[#2A2A2A] hover:text-white transition-all duration-200 hover:scale-105"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-[#0D0D0D] rounded-b-2xl border-t border-[#1F1F1F]">
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message... (Entrée pour envoyer)"
                    disabled={isLoading}
                    rows={1}
                    className="w-full px-5 py-4 bg-[#1A1A1A] border border-[#333] rounded-2xl text-white placeholder:text-[#666] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200 disabled:opacity-50"
                  />
                </div>
                
                {/* Animated Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="animated-send-btn group relative h-14 w-14 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-conic from-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-purple-500 opacity-80 group-hover:opacity-100 group-disabled:opacity-30 transition-opacity animate-spin-slow" />
                  
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-conic from-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-purple-500 blur-md opacity-60 group-hover:opacity-80 group-disabled:opacity-0 transition-opacity animate-spin-slow" />
                  
                  {/* Button background */}
                  <div className="absolute inset-[3px] rounded-xl bg-[#0D0D0D] flex items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <svg 
                        viewBox="0 0 24 24" 
                        className="h-6 w-6 text-white transform rotate-45 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Footer info */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#666]">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  Powered by AI
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  x402 Protocol
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-400" />
                  Sécurisé
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .bg-gradient-conic {
          background: conic-gradient(
            from 0deg,
            #a855f7,
            #ec4899,
            #ef4444,
            #f97316,
            #eab308,
            #22c55e,
            #06b6d4,
            #3b82f6,
            #a855f7
          );
        }
      `}</style>
    </div>
  )
}