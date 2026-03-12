"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Social icons (inline SVG) ──────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <circle cx="8" cy="12" r="2.5"/>
      <path d="M14 10h4M14 14h3" strokeLinecap="round"/>
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [signinError, setSigninError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loadingSignin, setLoadingSignin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [toast, setToast] = useState(false);

  function showSocialToast() {
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSigninError("");
    setLoadingSignin(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API}/auth/account/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setSigninError(data.message ?? "Identifiants incorrects");
        return;
      }
      const data = (await res.json()) as { access_token: string; account: { firstName: string; lastName: string } };
      const maxAge = 7 * 24 * 3600;
      document.cookie = `account_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `account_firstName=${encodeURIComponent(data.account.firstName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `account_lastName=${encodeURIComponent(data.account.lastName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
      const res = await fetch(`${API}/auth/account/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          age: Number(form.get("age")),
          email: form.get("email"),
          password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setSignupError(data.message ?? "Erreur lors de l'inscription");
        return;
      }
      const data = (await res.json()) as { access_token: string; account: { firstName: string; lastName: string } };
      const maxAge = 7 * 24 * 3600;
      document.cookie = `account_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `account_firstName=${encodeURIComponent(data.account.firstName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `account_lastName=${encodeURIComponent(data.account.lastName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      router.push("/home");
    } catch {
      setSignupError("Erreur de connexion au serveur");
    } finally {
      setLoadingSignup(false);
    }
  }

  return (
    <>
      {/* Toast */}
      <div
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-6 transition-all duration-300"
        style={{ opacity: toast ? 1 : 0, transform: `translateY(${toast ? 0 : -12}px)`, pointerEvents: "none" }}
      >
        <div className="bg-[#1e1b30] border border-white/10 rounded-2xl px-4 py-3 flex items-start gap-3 shadow-xl">
          <span className="text-lg mt-0.5">⚠️</span>
          <p className="text-white/80 text-xs leading-relaxed">
            <span className="font-semibold text-white">Connexion sociale indisponible.</span>
            <br />
            Merci d'utiliser le formulaire email ci-dessus.
          </p>
        </div>
      </div>

    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background: `
          radial-gradient(ellipse at 70% 10%, rgba(140, 60, 80, 0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 80%, rgba(100, 20, 140, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 90%, rgba(80, 30, 120, 0.3) 0%, transparent 50%),
          #0d0b1e
        `,
      }}
    >
      <div className="w-full max-w-sm">
        {/* Title */}
        <h1
          className="text-white text-4xl font-bold text-center mb-2"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          {tab === "signin" ? "Connexion" : "Inscription"}
        </h1>
        <p
          className="text-white/60 text-sm text-center mb-8"
          style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
        >
          {tab === "signin" ? "Connecte toi" : "Crée un compte"}
        </p>

        {/* Signin form */}
        {tab === "signin" && (
          <form onSubmit={handleSignin} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Mot de passe"
              required
              className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            {signinError && (
              <p className="text-red-400 text-xs text-center">{signinError}</p>
            )}
            <button
              type="submit"
              disabled={loadingSignin}
              className="w-full rounded-full py-4 text-sm font-bold text-[#1a1a2e] transition-opacity disabled:opacity-60 mt-1"
              style={{ background: "#FFCA44", fontFamily: "'SpaceGrotesk', sans-serif" }}
            >
              {loadingSignin ? "Connexion…" : "Continuer"}
            </button>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="firstName"
                autoComplete="given-name"
                placeholder="Prénom"
                required
                className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
                style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
              />
              <input
                name="lastName"
                autoComplete="family-name"
                placeholder="Nom"
                required
                className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
                style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
              />
            </div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mot de passe"
              required
              className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Confirmer le mot de passe"
              required
              className="w-full rounded-2xl bg-white text-gray-800 placeholder-gray-400 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#FFCA44]/60"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            {signupError && (
              <p className="text-red-400 text-xs text-center">{signupError}</p>
            )}
            <button
              type="submit"
              disabled={loadingSignup}
              className="w-full rounded-full py-4 text-sm font-bold text-[#1a1a2e] transition-opacity disabled:opacity-60 mt-1"
              style={{ background: "#FFCA44", fontFamily: "'SpaceGrotesk', sans-serif" }}
            >
              {loadingSignup ? "Inscription…" : "Continuer"}
            </button>
          </form>
        )}

        {/* Social divider */}
        <p
          className="text-white/40 text-xs text-center mt-7 mb-4"
          style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
        >
          {tab === "signin" ? "Ou connecte toi avec" : "Ou inscris-toi avec"}
        </p>

        {/* Social buttons */}
        <div className="flex items-center justify-center gap-3">
          {[
            { icon: <GoogleIcon />, label: "Google" },
            { icon: <FacebookIcon />, label: "Facebook" },
            { icon: <XIcon />, label: "X" },
            { icon: <IdCardIcon />, label: "ID" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={showSocialToast}
              className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Toggle */}
        <p
          className="text-white/40 text-xs text-center mt-8"
          style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
        >
          {tab === "signin" ? (
            <>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="text-[#FFCA44] font-semibold"
              >
                S&apos;inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="text-[#FFCA44] font-semibold"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </main>
    </>
  );
}
