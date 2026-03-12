"use client";

import { ChevronLeft, User, Mail, Lock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilSettingsPage() {
  const router = useRouter();

  function logout() {
    document.cookie = "account_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  }

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
        <h1
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          Paramètres
        </h1>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {/* Compte */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <p className="text-white/40 text-xs uppercase tracking-widest px-4 pt-4 pb-2">
            Compte
          </p>
          {[
            { icon: User, label: "Nom & Prénom" },
            { icon: Mail, label: "Adresse e-mail" },
            { icon: Lock, label: "Mot de passe" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center gap-4 px-4 py-3.5 border-t border-white/5 active:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">
                {label}
              </span>
              <ChevronLeft
                className="w-4 h-4 text-white/30 rotate-180"
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
