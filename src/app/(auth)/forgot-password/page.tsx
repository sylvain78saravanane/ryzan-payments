"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de l'email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {success ? (
        <Card className="w-full max-w-md border-green-500/20 bg-green-500/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <Mail className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-500">Email envoyé !</CardTitle>
            <CardDescription className="text-foreground/80 mt-2">
              Si un compte existe avec l'adresse <span className="font-medium">{email}</span>, vous recevrez un lien pour réinitialiser votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Vérifiez votre boîte de réception ainsi que vos spams.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div style={{ borderRadius: "50px", overflow: "hidden", width: "fit-content" }}>
                <Image src="/logo1.png" width={120} height={120} alt="Ryzan Logo" />
              </div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-xl">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Mot de passe oublié ?</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Envoyer le lien
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 underline-offset-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}