"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AlertCircle, CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

  // Vérifier si l'utilisateur a un token valide (via le hash de l'URL)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      // Supabase gère automatiquement la session via le hash
      supabase.auth.getSession();
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Redirection vers le login après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la réinitialisation.");
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
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-500">
              Mot de passe modifié !
            </CardTitle>
            <CardDescription className="text-foreground/80 mt-2">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">Se connecter maintenant</Button>
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
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={20}
                  pattern={passwordPattern}
                  title="Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères, une majuscule, un chiffre et un caractère spécial.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Modification...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" /> Réinitialiser le mot de passe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Vous vous souvenez ?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}