"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const router = useRouter();
  const [signinError, setSigninError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loadingSignin, setLoadingSignin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSigninError("");
    setLoadingSignin(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/account/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            password: form.get("password"),
          }),
        }
      );
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setSigninError(data.message ?? "Identifiants incorrects");
        return;
      }
      const data = (await res.json()) as { access_token: string };
      document.cookie = `account_token=${data.access_token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push("/home");
    } catch {
      setSigninError("Erreur de connexion au serveur");
    } finally {
      setLoadingSignin(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignupError("");
    setLoadingSignup(true);
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    if (password !== confirm) {
      setSignupError("Les mots de passe ne correspondent pas");
      setLoadingSignup(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/account/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            age: Number(form.get("age")),
            email: form.get("email"),
            password,
          }),
        }
      );
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setSignupError(data.message ?? "Erreur lors de l'inscription");
        return;
      }
      const data = (await res.json()) as { access_token: string };
      document.cookie = `account_token=${data.access_token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push("/home");
    } catch {
      setSignupError("Erreur de connexion au serveur");
    } finally {
      setLoadingSignup(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      {/* Logo / Titre */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Mirokaï</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Votre expérience immersive à Paris
        </p>
      </div>

      <div className="w-full max-w-sm">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          {/* ── SIGNIN ── */}
          <TabsContent value="signin">
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Mot de passe</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              {signinError && (
                <p className="text-destructive text-sm">{signinError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loadingSignin}>
                {loadingSignin ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          {/* ── SIGNUP ── */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Jean"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="25"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmer</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              {signupError && (
                <p className="text-destructive text-sm">{signupError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loadingSignup}>
                {loadingSignup ? "Inscription…" : "Créer mon compte"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
