"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2, UserPlus } from "lucide-react";


export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {

                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                {success ? (
                    <Card className="w-full max-w-md border-green-500/20 bg-green-500/10 backdrop-blur-xl">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-green-500">Compte créé !</CardTitle>
                            <CardDescription className="text-foreground/80 mt-2">
                                Vérifiez votre boîte mail ({email}) pour confirmer votre inscription avant de vous connecter.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-center">
                            <Link href="/login">
                                <Button variant="outline" className="w-full">Retour à la connexion</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
                        <CardHeader className="space-y-1 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <UserPlus className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
                            <CardDescription>
                                Rejoignez la révolution des paiements x402
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <form onSubmit={handleRegister} className="space-y-4">

                                {/* Ligne Prénom / Nom */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Satoshi"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nom</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Nakamoto"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="exemple@ryzan.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
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
                                    <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                                </div>

                                {/* Confirmation du mot de passe */}
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
                                    {/* Feedback visuel immédiat si ça ne matche pas (optionnel) */}
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-[10px] text-destructive">
                                            Les mots de passe ne correspondent pas.
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
                                        </>
                                    ) : (
                                        "S'inscrire"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Déjà un compte ?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                                    Se connecter
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}