"use client";

import {
  ChevronLeft,
  User,
  Mail,
  Lock,
  LogOut,
  Check,
  X,
  CircleQuestionMark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Section = "name" | "email" | "password" | null;

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function inputClass() {
  return "w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-white/30 transition-colors";
}

export default function ProfilSettingsPage() {
  const router = useRouter();
  const [open, setOpen] = useState<Section>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Section>(null);
  const [error, setError] = useState("");

  // Name fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Email
  const [email, setEmail] = useState("");
  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setFirstName(getCookie("account_firstName"));
    setLastName(getCookie("account_lastName"));
    apiFetch<{ email: string }>("/accounts/me")
      .then((me) => setEmail(me.email))
      .catch(() => {});
  }, []);

  function toggle(section: Section) {
    setOpen((prev) => (prev === section ? null : section));
    setError("");
  }

  async function save(section: Section, body: Record<string, string>) {
    setLoading(true);
    setError("");
    try {
      const updated = await apiFetch<{
        firstName?: string;
        lastName?: string;
        email?: string;
      }>("/accounts/me", { method: "PATCH", body: JSON.stringify(body) });
      if (updated.firstName) {
        const maxAge = 7 * 24 * 3600;
        document.cookie = `account_firstName=${encodeURIComponent(updated.firstName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `account_lastName=${encodeURIComponent(updated.lastName ?? lastName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        setFirstName(updated.firstName);
        setLastName(updated.lastName ?? lastName);
      }
      if (updated.email) setEmail(updated.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(null);
      setSuccess(section);
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      setError(e.message ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  function handleName(e: React.FormEvent) {
    e.preventDefault();
    save("name", { firstName, lastName });
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    save("email", { email });
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      setError("Minimum 6 caractères");
      return;
    }
    save("password", { currentPassword, newPassword });
  }

  function logout() {
    document.cookie = "account_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "account_firstName=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "account_lastName=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  }

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/home")}
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

      <div className="flex flex-col gap-4">
        {/* Compte */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <p className="text-white/40 text-xs uppercase tracking-widest px-4 pt-4 pb-2">
            Compte
          </p>

          {/* Nom & Prénom */}
          <div className="border-t border-white/5">
            <button
              onClick={() => toggle("name")}
              className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {success === "name" ? (
                  <Check className="w-4 h-4 text-green-400" strokeWidth={2} />
                ) : (
                  <User className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">
                {firstName || lastName
                  ? `${firstName} ${lastName}`
                  : "Nom & Prénom"}
              </span>
              <ChevronLeft
                className="w-4 h-4 text-white/30 transition-transform duration-200"
                style={{
                  transform:
                    open === "name" ? "rotate(270deg)" : "rotate(180deg)",
                }}
                strokeWidth={1.5}
              />
            </button>
            {open === "name" && (
              <form
                onSubmit={handleName}
                className="px-4 pb-4 flex flex-col gap-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    required
                    className={inputClass()}
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    required
                    className={inputClass()}
                  />
                </div>
                {error && open === "name" && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <SaveRow loading={loading} onCancel={() => toggle("name")} />
              </form>
            )}
          </div>

          {/* Email */}
          <div className="border-t border-white/5">
            <button
              onClick={() => toggle("email")}
              className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {success === "email" ? (
                  <Check className="w-4 h-4 text-green-400" strokeWidth={2} />
                ) : (
                  <Mail className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left truncate">
                {email || "Adresse e-mail"}
              </span>
              <ChevronLeft
                className="w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200"
                style={{
                  transform:
                    open === "email" ? "rotate(270deg)" : "rotate(180deg)",
                }}
                strokeWidth={1.5}
              />
            </button>
            {open === "email" && (
              <form
                onSubmit={handleEmail}
                className="px-4 pb-4 flex flex-col gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  required
                  className={inputClass()}
                />
                {error && open === "email" && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <SaveRow loading={loading} onCancel={() => toggle("email")} />
              </form>
            )}
          </div>

          {/* Mot de passe */}
          <div className="border-t border-white/5">
            <button
              onClick={() => toggle("password")}
              className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {success === "password" ? (
                  <Check className="w-4 h-4 text-green-400" strokeWidth={2} />
                ) : (
                  <Lock className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">
                Mot de passe
              </span>
              <ChevronLeft
                className="w-4 h-4 text-white/30 transition-transform duration-200"
                style={{
                  transform:
                    open === "password" ? "rotate(270deg)" : "rotate(180deg)",
                }}
                strokeWidth={1.5}
              />
            </button>
            {open === "password" && (
              <form
                onSubmit={handlePassword}
                className="px-4 pb-4 flex flex-col gap-3"
              >
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  required
                  className={inputClass()}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  className={inputClass()}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  required
                  className={inputClass()}
                />
                {error && open === "password" && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <SaveRow
                  loading={loading}
                  onCancel={() => toggle("password")}
                />
              </form>
            )}
          </div>
        </div>
        {/* F.A.Q */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <p className="text-white/40 text-xs uppercase tracking-widest px-4 pt-4 pb-2">
            F.A.Q
          </p>

          {/* Question / Réponse */}
          <div className="border-t border-white/5">
            <button
              onClick={() => router.push("/faq")}
              className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <CircleQuestionMark
                  className="w-4 h-4 text-white/60"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">
                Question / Réponse
              </span>
              <ChevronLeft
                className="w-4 h-4 text-white/30 transition-transform duration-200"
                strokeWidth={1.5}
              />
            </button>
          </div>
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

function SaveRow({
  loading,
  onCancel,
}: {
  loading: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 text-sm font-medium active:scale-95 transition-all flex items-center justify-center gap-1.5"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
        Annuler
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 py-2.5 rounded-xl text-[#1a1a2e] text-sm font-semibold disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        style={{ background: "#FFCA44" }}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        {loading ? "Sauvegarde…" : "Enregistrer"}
      </button>
    </div>
  );
}
