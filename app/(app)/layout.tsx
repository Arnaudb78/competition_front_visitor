"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Video, Trophy, CalendarDays } from "lucide-react";

const tabs = [
  { href: "/home", icon: User },
  { href: "/media", icon: Video },
  { href: "/jeu", icon: Trophy },
  { href: "/calendrier", icon: CalendarDays },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh text-white flex flex-col" style={{
      background: `
        radial-gradient(ellipse at 80% 100%, rgba(140, 40, 160, 0.35) 0%, transparent 55%),
        radial-gradient(ellipse at 20% 80%, rgba(100, 20, 140, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 0%, rgba(80, 30, 120, 0.2) 0%, transparent 50%),
        #0d0b1e
      `,
    }}>
      {/* Contenu principal */}
      <div className="flex-1 pb-28">
        {children}
      </div>

      {/* Bottom tab bar — pill flottante */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-8">
        <nav
          className="flex items-center justify-between gap-2 px-4 py-3 rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {tabs.map(({ href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                  style={active ? { background: "#FFCA44" } : {}}
                >
                  <Icon
                    className="w-6 h-6 transition-colors"
                    style={{ color: active ? "#1a1a2e" : "rgba(255,255,255,0.85)" }}
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
