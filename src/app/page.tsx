"use client";

import {
  AlertTriangle,
  Calendar,
  Globe,
  Heart,
  PawPrint,
  Search,
  Sparkles,
  Users,
  MapPin,
} from "lucide-react";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const categoryItems = [
  {
    key: "encounters",
    href: "/feed",
    icon: Heart,
    color: "from-pink-500/20 to-red-500/10",
  },
  {
    key: "adoption",
    href: "/adopt",
    icon: PawPrint,
    color: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    key: "lostFound",
    href: "/lost-found",
    icon: Search,
    color: "from-rose-500/20 to-orange-500/10",
  },
  {
    key: "community",
    href: "/community",
    icon: Users,
    color: "from-green-500/20 to-emerald-500/10",
  },
  {
    key: "events",
    href: "/events",
    icon: Calendar,
    color: "from-orange-500/20 to-yellow-500/10",
  },
  {
    key: "nearby",
    href: "/services",
    icon: MapPin,
    color: "from-blue-500/20 to-cyan-500/10",
  },
] as const;

export default function Home() {
  const dict = useTranslation();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
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
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,103,126,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(255,145,82,0.14),_transparent_24%)] pointer-events-none" />

      <div className="absolute top-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* NAVBAR */}
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/10 text-primary shadow-[0_0_25px_rgba(255,255,255,0.1)]">
              <PawPrint className="h-6 w-6" />
            </div>

            <span className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
              Pawndr
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {dict.common.login}
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(255,0,100,0.35)] transition hover:scale-105 hover:bg-primary/90"
            >
              {dict.common.signup}
            </Link>
          </div>
        </nav>

        {/* ERROR */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[2rem] border border-red-500/30 bg-red-500/10 p-5 shadow-2xl"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-semibold">
                    Enlace de recuperación expirado
                  </p>

                  <p className="text-sm leading-6 text-white/70">
                    Por seguridad, los enlaces de recuperación caducan al
                    usarse.
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
        <main className="grid gap-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* LEFT */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-lg shadow-black/20 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-orange-300" />

              <span>La Comunidad #1 para Mascotas y Dueños</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                Conectá, Adoptá y
                <br />

                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300 bg-clip-text text-transparent">
                  Cuidá Tu Comunidad Mascotera.
                </span>
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
                Pawndr une adopciones, mascotas perdidas, encuentros,
                comunidad y eventos en una sola plataforma.
              </p>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-3">
              {[
                "Encuentros",
                "Adopciones",
                "Mascotas Perdidas",
                "Comunidad",
                "Eventos",
                "Cerca tuyo",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(255,0,100,0.4)] transition hover:scale-105 hover:bg-primary/90"
              >
                Unirme a la Comunidad 🐾
              </Link>
            </div>

            {/* USERS */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((item) => (
                  <img
                    key={item}
                    src={`https://i.pravatar.cc/100?img=${item + 10}`}
                    className="h-12 w-12 rounded-full border-2 border-[#020617]"
                  />
                ))}
              </div>

              <p className="text-sm text-white/60">
                <span className="font-bold text-pink-400">+12.000</span>{" "}
                dueños ya forman parte de Pawndr
              </p>
            </div>
          </section>

          {/* RIGHT VISUAL */}
          <section className="relative h-[650px]">
            {/* MAIN DOG */}
            <div className="absolute right-10 top-0 w-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_0_60px_rgba(255,0,120,0.2)] backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1200&auto=format&fit=crop"
                className="h-[300px] w-full object-cover"
              />

              <div className="p-4">
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-300">
                  ❤️ Encuentro
                </span>
              </div>
            </div>

            {/* CAT */}
            <div className="absolute left-10 top-40 w-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop"
                className="h-[220px] w-full object-cover"
              />

              <div className="p-4">
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                  🏠 Adopción
                </span>
              </div>
            </div>

            {/* LOST */}
            <div className="absolute right-0 top-56 w-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop"
                className="h-[180px] w-full object-cover"
              />

              <div className="space-y-2 p-4">
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-300">
                  🔎 Perdido
                </span>

                <p className="font-semibold">Luna está perdida</p>

                <p className="text-sm text-white/60">
                  Zona Palermo, CABA
                </p>
              </div>
            </div>

            {/* EVENT */}
            <div className="absolute bottom-10 right-10 w-[240px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop"
                className="h-[180px] w-full object-cover"
              />

              <div className="space-y-2 p-4">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                  📅 Evento
                </span>

                <p className="font-semibold">Paseo de Mascotas</p>

                <p className="text-sm text-white/60">
                  Domingo 25 Mayo · Palermo
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* FEATURES */}
        <section className="mt-24">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-black">
              Qué podés hacer en{" "}
              <span className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
                Pawndr
              </span>
            </h2>

            <p className="mt-4 text-white/60">
              Todo lo que vos y tu mascota necesitan, en un solo lugar.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-2 hover:border-white/20 hover:bg-white/10"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color}`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-white">
                    {dict.landing.categories[item.key].title}
                  </h3>

                  <p className="mt-3 leading-7 text-white/60">
                    {dict.landing.categories[item.key].desc}
                  </p>

                  <div className="mt-5 text-sm font-semibold text-pink-400">
                    Explorar →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* STATS */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {[
              ["12.000+", "Mascotas registradas"],
              ["3.500+", "Adopciones realizadas"],
              ["800+", "Mascotas reunidas"],
              ["25.000+", "Miembros en la comunidad"],
            ].map(([value, label]) => (
              <div key={label} className="p-8 text-center">
                <p className="text-4xl font-black bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
                  {value}
                </p>

                <p className="mt-2 text-sm text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMING SOON */}
        <section className="mt-20 text-center">
          <p className="text-2xl font-bold text-pink-400">
            ✨ Próximamente
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/60">
            Muy pronto vas a poder descargar Pawndr y llevar toda la comunidad
            en tu bolsillo.
          </p>
        </section>

        {/* MOBILE */}
        <section className="mt-16 grid items-center gap-14 lg:grid-cols-2">
          <div className="flex items-end justify-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop"
              className="h-[450px] w-[220px] rounded-[3rem] border border-white/10 object-cover shadow-[0_0_40px_rgba(255,0,120,0.15)]"
            />

            <img
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop"
              className="h-[520px] w-[240px] rounded-[3rem] border border-white/10 object-cover shadow-[0_0_40px_rgba(255,0,120,0.15)]"
            />

            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop"
              className="h-[450px] w-[220px] rounded-[3rem] border border-white/10 object-cover shadow-[0_0_40px_rgba(255,0,120,0.15)]"
            />
          </div>

          <div>
            <h2 className="text-5xl font-black leading-tight">
              Todo en tu bolsillo.
              <br />

              <span className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
                Siempre conectado.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/60">
              Llevá a Pawndr a donde vayas y no te pierdas nada importante.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/70">
                📱 App Store
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/70">
                🤖 Google Play
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-24 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-[0_0_40px_rgba(255,0,120,0.3)]">
                <PawPrint className="h-9 w-9" />
              </div>

              <div>
                <h3 className="text-3xl font-black">
                  Sumate a la comunidad mascotera más activa.
                </h3>

                <p className="mt-2 text-white/60">
                  Es gratis, rápido y tu mascota te lo va a agradecer.
                </p>
              </div>
            </div>

            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-semibold text-white shadow-[0_0_40px_rgba(255,0,100,0.4)] transition hover:scale-105 hover:bg-primary/90"
            >
              Crear Cuenta Gratis 🐾
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}