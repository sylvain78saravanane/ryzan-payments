import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, InfoIcon, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 space-y-8 max-w-4xl mx-auto">
    
    <div style={{borderRadius:'50px', overflow:'hidden'}}>
        <Image src={"/logo1.png"} width={200} height={200} alt="Ryzan Logo"/>
    </div>
      {/* Badge "Avalanche Powered" */}
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
        <CreditCard className="w-3 h-3 mr-1 text-yellow-500" />
        Powered by Avalanche & x402 Protocol
      </div>

      {/* Titre Principal */}
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
        Welcome to <span className="text-primary">Ryzan Payments</span>
      </h1>

      {/* Ton texte descriptif */}
      <p className="text-xl text-muted-foreground max-w-2xl">
        L'application de paiement transfrontalier avec le protocole <span className="font-semibold text-foreground">x402</span> et <span className="font-semibold text-foreground">AI</span>, qui s'allie à la Blockchain <span className="text-red-500 font-medium">Avalanche</span>.
      </p>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link href="/login">
          <Button size="lg" className="w-full sm:w-auto gap-2">
            Se connecter <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Créer un compte
          </Button>
        </Link>
      </div>

      <div>
        <Link href={"/info"}>
          <Button variant={"link"}>
            <InfoIcon/>
            Découvrir la solution !
          </Button>
        </Link>
      </div>

      {/* Petits avantages visuels */}
      <div className="pt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Sécurisé
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" /> Rapide (C-Chain)
        </div>
      </div>
    </section>
  );
}