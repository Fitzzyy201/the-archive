"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, UserRound, Inbox } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const navItems = [
  {
    label: "BERANDA",
    href: "/beranda", //blm diisi
    icon: Home,
  },
  {
    label: "NOTIFICATION",
    href: "/notifikasi-buyer",
    icon: Bell,
  },
  {
    label: "PROFILE",
    href: "/profile-buyer", //ini juga blm
    icon: UserRound,
  },
];

export default function NotifikasiSellerPage() {
  const pathname = usePathname();

  return (
    <main
      className={`${inter.variable} ${playfair.variable} min-h-screen w-full bg-white text-black`}
    >
     
      <nav className="sticky top-0 z-50 w-full bg-white">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max justify-center border-b border-[#e5e5e5]">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex h-[78px] min-w-[170px] items-center justify-center gap-2 px-8 md:min-w-[200px] lg:min-w-[220px]"
                >
              
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-black transition-transform duration-300 group-hover:-translate-y-[1px]"
                  />

                  <span className="text-[9px] font-medium tracking-[1px] text-black transition-opacity duration-300 group-hover:opacity-60">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-[60px] -translate-x-1/2 bg-black" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-78px)] w-full items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">

          <div className="mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-full border border-[#dddddd]">
            <Inbox
              size={27}
              strokeWidth={1.2}
              className="text-[#555555]"
            />
          </div>

          <h1 className="font-[var(--font-playfair)] text-[28px] tracking-[-0.5px]">
            No Notifications
          </h1>

          <p className="mt-2 max-w-[380px] text-[11px] leading-[1.7] text-[#888888]">
            Belum ada notifikasi untuk saat ini.
            <br />
            Notifikasi aktivitas seller akan muncul di sini.
          </p>

        </div>
      </section>
    </main>
  );
}