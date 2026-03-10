"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  function logout() {
    document.cookie =
      "account_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center gap-6">
      <h1 className="text-3xl font-bold">Bienvenue sur Mirokaï</h1>
      <p className="text-muted-foreground max-w-xs">
        Votre expérience immersive commence ici.
      </p>
      <Button variant="outline" onClick={logout}>
        Se déconnecter
      </Button>
    </main>
  );
}
