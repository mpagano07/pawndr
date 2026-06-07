"use client";

import {
  AlertTriangle,
  Calendar,
  Heart,
  PawPrint,
  Search,
  Sparkles,
  Users,
  MapPin,
  LogOut,
  MessageSquare,
  ArrowRight,
  Bookmark,
  Home as HomeIcon,
  Plus,
} from "lucide-react";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const categoryItems = [
  {
    key: "encounters",
    href: "/feed",
    icon: Heart,
    color: "text-[#ff2d55]",
    bgColor: "bg-[#ff2d55]/10",
    borderColor: "border-[#ff2d55]/20",
    glowColor: "rgba(255, 45, 85, 0.35)",
    hoverBorder: "hover:border-[#ff2d55]/40",
  },
  {
    key: "adoption",
    href: "/adopt",
    icon: HomeIcon,
    color: "text-[#a855f7]",
    bgColor: "bg-[#a855f7]/10",
    borderColor: "border-[#a855f7]/20",
    glowColor: "rgba(168, 85, 247, 0.35)",
    hoverBorder: "hover:border-[#a855f7]/40",
  },
  {
    key: "lostFound",
    href: "/lost-found",
    icon: Search,
    color: "text-[#f43f5e]",
    bgColor: "bg-[#f43f5e]/10",
    borderColor: "border-[#f43f5e]/20",
    glowColor: "rgba(244, 63, 94, 0.35)",
    hoverBorder: "hover:border-[#f43f5e]/40",
  },
  {
    key: "community",
    href: "/community",
    icon: MessageSquare,
    color: "text-[#10b981]",
    bgColor: "bg-[#10b981]/10",
    borderColor: "border-[#10b981]/20",
    glowColor: "rgba(16, 185, 129, 0.35)",
    hoverBorder: "hover:border-[#10b981]/40",
  },
  {
    key: "events",
    href: "/community",
    icon: Calendar,
    color: "text-[#f97316]",
    bgColor: "bg-[#f97316]/10",
    borderColor: "border-[#f97316]/20",
    glowColor: "rgba(249, 115, 22, 0.35)",
    hoverBorder: "hover:border-[#f97316]/40",
  },
  {
    key: "nearby",
    href: "/services",
    icon: MapPin,
    color: "text-[#06b6d4]",
    bgColor: "bg-[#06b6d4]/10",
    borderColor: "border-[#06b6d4]/20",
    glowColor: "rgba(6, 182, 212, 0.35)",
    hoverBorder: "hover:border-[#06b6d4]/40",
  },
] as const;

export default function Home() {
  const dict = useTranslation();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [authError, setAuthError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
          });
      }
    });
    const errorCode = searchParams.get("error_code");
    const errorDesc = searchParams.get("error_description");
    const hash = window.location.hash;

    if (
      errorCode === "otp_expired" ||
      hash.includes("otp_expired") ||
      hash.includes("expired") ||
      (errorDesc && errorDesc.toLowerCase().includes("expired"))
    ) {
      setAuthError(true);
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#030206] text-white selection:bg-[#FF1A5E]/30 selection:text-white">
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Radiant blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#ff1a5e]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[-5%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#8b5cf6]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#ff1a5e]/8 to-[#8b5cf6]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#ff1a5e]/5 to-transparent blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* NAVBAR */}
        <nav className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-[#FF1A5E] drop-shadow-[0_0_10px_rgba(255,26,94,0.6)]" />
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Pawndr
            </span>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/feed"
                  className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-white/10 hover:border-white/20"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#FF1A5E] flex items-center justify-center text-[10px] font-bold">
                      {profile?.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline">
                    {profile?.full_name || "Mi Perfil"}
                  </span>
                  <span className="sm:hidden">App</span>
                </Link>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 transition hover:bg-red-500/20 hover:scale-105 animate-none"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-white/80 transition hover:text-white hover:underline"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[#FF1A5E] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,26,94,0.35)] transition duration-300 hover:scale-105 hover:bg-[#ff3370] hover:shadow-[0_0_25px_rgba(255,26,94,0.55)]"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ERROR */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-[2rem] border border-red-500/30 bg-red-500/10 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Enlace de recuperación expirado
                  </p>

                  <p className="text-sm leading-6 text-white/70">
                    Por seguridad, los enlaces de recuperación caducan al
                    usarse o tras cierto tiempo.
                  </p>
                </div>
              </div>

              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          </motion.div>
        )}

        {/* HERO */}
        <main className="grid gap-12 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* LEFT HERO */}
          <section className="space-y-8">
            {/* Sparkle badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-[#FF8E53] shadow-[0_0_15px_rgba(245,158,11,0.08)] backdrop-blur-xl">
              <span className="text-sm">🔥</span>
              <span className="text-white/80 font-medium">
                La Comunidad #1 para Mascotas y Dueños
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                Conectá, Adoptá y <br />
                Cuidá Tu{" "}
                <span className="bg-gradient-to-r from-[#FF2D55] via-[#FF3B30] to-[#FF9500] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,45,85,0.15)]">
                  Comunidad
                </span>{" "}
                <br />
                <span className="bg-gradient-to-r from-[#FF2D55] via-[#FF3B30] to-[#FF9500] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,45,85,0.15)]">
                  Mascotera.
                </span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-white/60">
                Pawndr une adopciones, mascotas perdidas, encuentros, foros y
                eventos en una sola plataforma.
              </p>
            </div>

            {/* TAGS PILLS */}
            <div className="flex flex-wrap gap-2.5 max-w-xl">
              {[
                { name: "Encuentros", icon: Heart, color: "text-[#ff2d55]" },
                { name: "Adopciones", icon: HomeIcon, color: "text-[#a855f7]" },
                {
                  name: "Mascotas Perdidas",
                  icon: Search,
                  color: "text-[#06b6d4]",
                },
                { name: "Comunidad", icon: MessageSquare, color: "text-[#10b981]" },
                { name: "Eventos", icon: Calendar, color: "text-[#f97316]" },
                { name: "Cerca tuyo", icon: MapPin, color: "text-[#3b82f6]" },
              ].map((pill) => {
                const IconComp = pill.icon;
                return (
                  <div
                    key={pill.name}
                    className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/95 backdrop-blur-xl shadow-sm"
                  >
                    <IconComp className={`h-3.5 w-3.5 ${pill.color} fill-current`} />
                    <span>{pill.name}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href={user ? "/community" : "/auth/signup"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1A5E] px-9 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(255,26,94,0.35)] transition duration-300 hover:scale-105 hover:bg-[#ff3370] hover:shadow-[0_0_40px_rgba(255,26,94,0.55)]"
              >
                Unirme a la Comunidad
                <PawPrint className="h-5 w-5 fill-current" />
              </Link>
            </div>

            {/* USERS STATS */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80",
                ].map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt={`User ${idx + 1}`}
                    className="h-10 w-10 rounded-full border-2 border-[#030206] object-cover"
                  />
                ))}
              </div>

              <p className="text-xs text-white/50">
                <span className="font-extrabold text-[#FF1A5E] text-sm mr-1">
                  +12.000
                </span>
                dueños ya forman parte de Pawndr
              </p>
            </div>
          </section>

          {/* RIGHT VISUAL - OVERLAPPING CARDS & ORBITS */}
          <section className="relative h-[580px] w-full flex items-center justify-center mt-10 lg:mt-0">
            {/* Dotted Concentric Orbits */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                width="420"
                height="420"
                viewBox="0 0 420 420"
                fill="none"
                className="opacity-25"
              >
                <circle
                  cx="210"
                  cy="210"
                  r="120"
                  stroke="rgba(255, 26, 94, 0.2)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="210"
                  cy="210"
                  r="170"
                  stroke="rgba(168, 85, 247, 0.2)"
                  strokeWidth="1.2"
                  strokeDasharray="6 8"
                />
                <circle
                  cx="210"
                  cy="210"
                  r="205"
                  stroke="rgba(255, 26, 94, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="5 10"
                />
              </svg>
            </div>

            {/* Glowing neon paw print icons floating on orbits */}
            <PawPrint className="absolute top-[8%] left-[28%] h-5 w-5 text-[#a855f7] opacity-60 drop-shadow-[0_0_8px_#a855f7] animate-pulse pointer-events-none" />
            <PawPrint className="absolute top-[18%] right-[12%] h-4 w-4 text-white/30 opacity-40 drop-shadow-[0_0_4px_white] pointer-events-none" />
            <PawPrint className="absolute bottom-[36%] right-[22%] h-5 w-5 text-[#FF1A5E] opacity-75 drop-shadow-[0_0_8px_#FF1A5E] animate-pulse pointer-events-none" />

            {/* CARD 1: Encuentro (Top Right-ish) */}
            <div className="absolute top-2 right-12 w-[185px] h-[185px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md z-20 group hover:scale-[1.03] transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400"
                alt="Encuentro Dog"
                className="h-[145px] w-full object-cover"
              />
              <div className="p-3 bg-black/30 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-white border border-white/10 backdrop-blur-sm">
                  <span className="text-[#ff2d55]">❤️</span> Encuentro
                </span>
              </div>
            </div>

            {/* CARD 2: Adopción (Middle Left) */}
            <div className="absolute top-24 left-4 w-[170px] h-[170px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md z-10 group hover:scale-[1.03] transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400"
                alt="Adoption Cat"
                className="h-[130px] w-full object-cover"
              />
              <div className="p-2.5 bg-black/30 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-white border border-white/10 backdrop-blur-sm">
                  <span className="text-[#a855f7]">🏠</span> Adopción
                </span>
              </div>
            </div>

            {/* CARD 3: Comunidad Post (Center Right-ish, layered low) */}
            <div className="absolute bottom-20 left-16 w-[230px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#09070f]/85 p-3.5 shadow-2xl backdrop-blur-xl z-30 group hover:scale-[1.03] transition duration-300">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60"
                  alt="Avatar"
                  className="h-7 w-7 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-tight">
                    Comunidad
                  </h4>
                  <p className="text-[8px] text-white/40">Hace 2 h</p>
                </div>
              </div>
              <p className="text-[10px] text-white/90 mt-2 font-medium">
                Recién adoptamos a Milo ❤️
              </p>
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400"
                alt="Puppy Milo"
                className="h-[100px] w-full object-cover rounded-xl mt-2 border border-white/5"
              />
              <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[9px] text-white/50">
                    <span className="text-red-500 text-xs">❤️</span> 142
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-white/50">
                    <MessageSquare className="w-3 h-3 text-[#10b981]" /> 23
                  </span>
                </div>
                <Bookmark className="w-3.5 h-3.5 text-white/40 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* CARD 4: Perdida Dog (Top Far-Right) */}
            <div className="absolute top-28 right-0 w-[165px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d070b]/90 p-3 shadow-xl backdrop-blur-xl z-25 group hover:scale-[1.03] transition duration-300">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300"
                  alt="Lost Dog"
                  className="h-[110px] w-full object-cover rounded-xl border border-white/5"
                />
                <span className="absolute top-2 left-2 rounded bg-[#ff2d55] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                  🚨 Perdida
                </span>
              </div>
              <div className="mt-2.5">
                <h4 className="text-[11px] font-bold text-white">
                  Luna está perdida
                </h4>
                <p className="text-[9px] text-white/50 mt-0.5">
                  Zona Palermo, CABA
                </p>
              </div>
            </div>

            {/* CARD 5: Evento Husky (Bottom Right) */}
            <div className="absolute bottom-4 right-1 w-[265px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#06040a]/90 p-3 shadow-2xl backdrop-blur-xl z-40 group hover:scale-[1.03] transition duration-300 flex items-center gap-3">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#f97316]/10 border border-[#f97316]/20 px-2.5 py-0.5 text-[8px] font-bold text-[#f97316]">
                    Evento
                  </span>
                  <h4 className="text-[11px] font-bold text-white mt-1.5">
                    Paseo de Mascotas
                  </h4>
                  <p className="text-[8px] text-white/55 mt-0.5 leading-normal">
                    Dom 25 May · 15:00 hs <br />
                    Parque Centenario
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60",
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60",
                      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=60",
                    ].map((avatar, idx) => (
                      <img
                        key={idx}
                        src={avatar}
                        alt="Attendee"
                        className="h-5 w-5 rounded-full object-cover border border-black"
                      />
                    ))}
                  </div>
                  <span className="text-[8px] text-white/60 font-semibold">
                    +34 asistirán
                  </span>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=300"
                alt="Event husky"
                className="h-[105px] w-[95px] object-cover rounded-xl border border-white/5 flex-shrink-0"
              />
            </div>
          </section>
        </main>

        {/* FEATURES - "QUÉ PODÉS HACER" */}
        <section className="mt-28">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl text-white">
              Qué podés hacer en{" "}
              <span className="bg-gradient-to-r from-[#FF2D55] to-[#FF9500] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,45,85,0.1)]">
                Pawndr
              </span>
            </h2>

            <p className="mt-3 text-white/50 text-sm sm:text-base max-w-lg mx-auto">
              Todo lo que vos y tu mascota necesitan, en un solo lugar.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryItems.map((item) => {
              const IconComp = item.icon;

              return (
                <Link
                  key={item.key}
                  href={user ? item.href : "/auth/login"}
                  className={`group flex gap-4 overflow-hidden rounded-[2rem] border border-white/5 bg-[#0b0a14]/65 p-6 shadow-lg shadow-black/35 backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${item.hoverBorder} hover:bg-[#110f1f]/85`}
                  style={
                    {
                      "--glow-hover": item.glowColor,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl border ${item.borderColor} ${item.bgColor} shadow-sm group-hover:scale-105 transition`}
                  >
                    <IconComp className={`h-6 w-6 ${item.color}`} />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white transition group-hover:text-white">
                        {dict.landing.categories[item.key].title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-white/50">
                        {dict.landing.categories[item.key].desc}
                      </p>
                    </div>

                    <div
                      className={`mt-4 flex items-center gap-1 text-xs font-bold ${item.color}`}
                    >
                      Explorar{" "}
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* COUNTER STATS BAR */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/5 bg-[#0b0a14]/40 backdrop-blur-md">
          <div className="grid grid-cols-2 divide-white/5 sm:grid-cols-4 sm:divide-x divide-y sm:divide-y-0">
            {[
              {
                value: "12.000+",
                label: "Mascotas registradas",
                icon: PawPrint,
                color: "text-[#ff2d55]",
                bgColor: "bg-[#ff2d55]/10",
                borderColor: "border-[#ff2d55]/20",
              },
              {
                value: "3.500+",
                label: "Adopciones realizadas",
                icon: HomeIcon,
                color: "text-[#a855f7]",
                bgColor: "bg-[#a855f7]/10",
                borderColor: "border-[#a855f7]/20",
              },
              {
                value: "800+",
                label: "Mascotas reunidas",
                icon: Search,
                color: "text-[#f43f5e]",
                bgColor: "bg-[#f43f5e]/10",
                borderColor: "border-[#f43f5e]/20",
              },
              {
                value: "25.000+",
                label: "Miembros en la comunidad",
                icon: Users,
                color: "text-[#eab308]",
                bgColor: "bg-[#eab308]/10",
                borderColor: "border-[#eab308]/20",
              },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 sm:p-8 flex items-center gap-4 justify-start"
                >
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${stat.borderColor} ${stat.bgColor} ${stat.color}`}
                  >
                    <StatIcon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white leading-tight">
                      {stat.value}
                    </span>
                    <span className="text-[10px] font-bold tracking-wide text-white/50 uppercase mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMING SOON - PRÓXIMAMENTE */}
        <section className="mt-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#FF1A5E] bg-[#FF1A5E]/10 border border-[#FF1A5E]/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 fill-current" />
              Próximamente
              <Sparkles className="h-3 w-3 fill-current" />
            </span>

            <p className="mx-auto mt-4 max-w-md text-sm text-white/50 leading-relaxed">
              Muy pronto vas a poder descargar Pawndr y llevar toda la comunidad
              en tu bolsillo.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] items-center gap-12 max-w-5xl mx-auto">
            {/* 3D OVERLAPPING MOBILE MOCKUPS */}
            <div className="relative h-[440px] w-full max-w-[480px] mx-auto">
              {/* Phone 1: Comunidad (Left, Back layer) */}
              <div className="absolute left-[4%] bottom-[5%] w-[165px] h-[350px] rounded-[2.2rem] border-[4px] border-white/15 bg-[#030206] overflow-hidden shadow-2xl z-10 flex flex-col pointer-events-none transition duration-300 hover:scale-[1.02]">
                {/* Notch/pill */}
                <div className="w-16 h-3 bg-black rounded-full mx-auto mt-1 flex items-center justify-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-[#FF1A5E] rounded-full mr-1" />
                </div>
                {/* Screen content */}
                <div className="flex-1 p-2 flex flex-col overflow-hidden text-[8px]">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="font-extrabold text-white">Comunidad</span>
                    <Search className="w-2.5 h-2.5 text-white/40" />
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-2 text-[7px] text-white/40 py-1 font-bold">
                    <span className="text-white border-b border-[#FF1A5E] pb-0.5">
                      Para ti
                    </span>
                    <span>Siguiendo</span>
                    <span>Recientes</span>
                  </div>
                  {/* Post */}
                  <div className="mt-1.5 p-1.5 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60"
                        alt="Anny"
                        className="w-4.5 h-4.5 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-extrabold text-white text-[7px]">
                          Anny Thor
                        </h5>
                        <p className="text-[5px] text-white/45">@Anny.Diaz</p>
                      </div>
                      <span className="ml-auto text-[5px] text-white/40">
                        Hace 2 h
                      </span>
                    </div>
                    <p className="text-[6.5px] text-white/90 mt-1 font-medium leading-tight">
                      Día perfecto en el parque ❤️
                    </p>
                    <img
                      src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=300"
                      alt="Dogs running"
                      className="w-full h-[85px] object-cover rounded-md mt-1 border border-white/5"
                    />
                    <div className="flex gap-2 mt-1.5 pt-1 border-t border-white/5 text-[5px] text-white/40">
                      <span>❤️ 142</span>
                      <span>💬 23</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone 2: Explorar (Center, Forefront layer) */}
              <div className="absolute left-[30%] bottom-0 w-[190px] h-[400px] rounded-[2.8rem] border-[6px] border-white/20 bg-[#030206] overflow-hidden shadow-[0_0_35px_rgba(255,26,94,0.15)] z-20 flex flex-col transition duration-300 hover:scale-[1.03]">
                {/* Notch/pill */}
                <div className="w-18 h-3.5 bg-black rounded-full mx-auto mt-1 flex items-center justify-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-[#FF1A5E]/80 rounded-full mr-1.5" />
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                </div>
                {/* Screen content */}
                <div className="flex-1 flex flex-col overflow-hidden text-[9px] relative">
                  {/* Explorar Header */}
                  <div className="px-2.5 pt-2 flex items-center justify-between pb-1">
                    <span className="font-black text-white text-[11px]">
                      Explorar
                    </span>
                    <Search className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-2.5 text-[7px] text-white/45 px-2.5 py-1 font-extrabold">
                    <span className="text-white border-b border-[#FF1A5E] pb-0.5">
                      Todos
                    </span>
                    <span>Encuentros</span>
                    <span>Adopciones</span>
                    <span>Perdidos</span>
                  </div>
                  {/* Main Profile View */}
                  <div className="flex-1 m-2 rounded-[1.8rem] overflow-hidden relative border border-white/5">
                    <img
                      src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400"
                      alt="Rocky profile"
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                    {/* Profile text info */}
                    <div className="absolute bottom-2 left-2 right-2 text-white p-1.5">
                      <h5 className="font-extrabold text-[9.5px]">
                        Rocky
                      </h5>
                      <p className="text-[6.5px] text-white/70 font-medium">
                        2 años · Golden Retriever
                      </p>
                      <p className="text-[6px] text-white/50 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2 h-2 text-[#FF1A5E]" /> Palermo,
                        CABA
                      </p>
                    </div>
                    {/* Floating Heart Button */}
                    <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-[#FF1A5E] flex items-center justify-center shadow-lg border border-white/10 cursor-pointer">
                      <Heart className="h-3.5 w-3.5 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone 3: Eventos (Right, Back layer) */}
              <div className="absolute right-[4%] bottom-[5%] w-[165px] h-[350px] rounded-[2.2rem] border-[4px] border-white/15 bg-[#030206] overflow-hidden shadow-2xl z-10 flex flex-col pointer-events-none transition duration-300 hover:scale-[1.02]">
                {/* Notch/pill */}
                <div className="w-16 h-3 bg-black rounded-full mx-auto mt-1 flex items-center justify-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-[#FF1A5E] rounded-full" />
                </div>
                {/* Screen content */}
                <div className="flex-1 p-2 flex flex-col overflow-hidden text-[8px]">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="font-extrabold text-white">Eventos</span>
                    <Search className="w-2.5 h-2.5 text-white/40" />
                  </div>
                  <span className="text-[6.5px] text-white/45 font-extrabold py-1">
                    Próximos
                  </span>
                  {/* Event list */}
                  <div className="space-y-1.5 mt-1 overflow-hidden flex-1">
                    {/* Event item 1 */}
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 flex gap-1.5 items-center">
                      <div className="flex-1">
                        <h6 className="font-extrabold text-white text-[7px] leading-tight">
                          Paseo de Mascotas
                        </h6>
                        <p className="text-[5px] text-white/40 leading-none mt-0.5">
                          Dom 25 May · 15:00 hs <br />
                          Parque Centenario
                        </p>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=100"
                        alt="husky mini"
                        className="w-8 h-9 object-cover rounded-md"
                      />
                    </div>
                    {/* Event item 2 */}
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 flex gap-1.5 items-center">
                      <div className="flex-1">
                        <h6 className="font-extrabold text-white text-[7px] leading-tight">
                          Feria de Adopción
                        </h6>
                        <p className="text-[5px] text-white/40 leading-none mt-0.5">
                          Sáb 5 May · 14:00 hs <br />
                          Plaza Armenia
                        </p>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=100"
                        alt="puppy mini"
                        className="w-8 h-9 object-cover rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DESCRIPTION & STORE BADGES */}
            <div className="space-y-8 text-center md:text-left">
              <h2 className="text-4xl font-black leading-tight sm:text-5xl text-white">
                Todo en tu bolsillo. <br />
                <span className="bg-gradient-to-r from-[#FF2D55] via-[#FF3B30] to-[#FF9500] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,45,85,0.1)]">
                  Siempre conectado.
                </span>
              </h2>

              <p className="text-base text-white/60 leading-relaxed max-w-md mx-auto md:mx-0">
                Llevá a Pawndr a donde vayas y no te pierdas de nada importante.
              </p>

              {/* STORE BADGES */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                {/* APP STORE */}
                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 transition duration-300 w-[170px] shadow-lg shadow-black/40 group hover:scale-[1.03]"
                >
                  <svg
                    viewBox="0 0 384 512"
                    className="h-6 w-6 fill-white group-hover:text-[#FF1A5E] transition-colors"
                  >
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-46-19.1-74.5-19.1-37.4 0-77.5 21.8-96.8 55.6-39.7 70.3-10.2 173.8 28.3 228.2 19 27.2 41.5 57.5 70.8 56.4 28.3-1.1 38.9-18.2 71.3-18.2 32.4 0 42.1 18.2 71.2 17.6 30.2-.5 50.1-27.2 68.7-54.4 21.4-31.2 30.1-61.3 30.6-62.8-1.1-.5-58.6-22.5-58.8-87.9zM287.9 78.5c15.6-18.9 25.9-45.3 23-71.5-22.9.9-50.7 15.2-67.1 34.3-14.3 16.6-26.8 43.5-22.9 69.3 25.3 2 51.4-13.2 67-32.1z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[7.5px] font-bold text-white/50 uppercase tracking-widest leading-none">
                      Próximamente en
                    </span>
                    <span className="text-sm font-bold text-white mt-1 leading-none">
                      App Store
                    </span>
                  </div>
                </a>

                {/* GOOGLE PLAY */}
                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 transition duration-300 w-[170px] shadow-lg shadow-black/40 group hover:scale-[1.03]"
                >
                  <svg viewBox="0 0 512 512" className="h-6 w-6">
                    <path
                      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
                      fill="#ffcc00"
                    />
                    <path
                      d="M26.4 0C11.9 0 0 11.9 0 26.4v459.2C0 500.1 11.9 512 26.4 512c7.1 0 13.9-2.9 18.9-8.1l280-269.6L26.4 0z"
                      fill="#00e5ff"
                    />
                    <path
                      d="M325.3 277.7l60.1 60.1L104.6 499 325.3 277.7z"
                      fill="#ff3d00"
                    />
                    <path
                      d="M485.6 230.1L400 180.7l-74.7 75.8 74.7 75.8 85.6-49.4c16.5-9.5 16.5-24.9 0-32.8z"
                      fill="#4caf50"
                    />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[7.5px] font-bold text-white/50 uppercase tracking-widest leading-none">
                      PRÓXIMAMENTE EN
                    </span>
                    <span className="text-sm font-bold text-white mt-1 leading-none">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>

              <p className="text-xs text-white/40 mt-1 md:text-left">
                Disponible en iOS y Android
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA - BANNER FOOTER */}
        <section className="mt-28 rounded-[2.5rem] border border-[#FF1A5E]/20 bg-gradient-to-r from-[#160d21] to-[#090513] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#FF1A5E]/5">
          {/* subtle glow */}
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#FF1A5E]/10 blur-[75px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF1A5E] text-white shadow-[0_0_25px_rgba(255,26,94,0.45)] flex-shrink-0 animate-pulse">
              <PawPrint className="h-8 w-8 fill-current" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Sumate a la comunidad mascota más activa.
              </h3>

              <p className="mt-2 text-white/50 text-sm">
                Es gratis, rápido y tu mascota te lo va a agradecer.
              </p>
            </div>
          </div>

          <Link
            href={user ? "/community" : "/auth/signup"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1A5E] px-10 py-4.5 text-base font-bold text-white shadow-[0_0_35px_rgba(255,26,94,0.4)] transition duration-300 hover:scale-105 hover:bg-[#ff3370] hover:shadow-[0_0_45px_rgba(255,26,94,0.65)] whitespace-nowrap z-10"
          >
            Crear Cuenta Gratis
            <PawPrint className="h-5 w-5 fill-current" />
          </Link>
        </section>
      </div>
    </div>
  );
}