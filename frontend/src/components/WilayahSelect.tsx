"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Province = { id: string; name: string };
type Regency = { id: string; provinceId: string; name: string };

type WilayahSelectProps = {
  value: string;
  onChange: (kota: string) => void;
  className?: string;
  required?: boolean;
  placeholderKota?: string;
};

/**
 * Dropdown Provinsi -> Kota (Kota/Kabupaten Indonesia).
 * Kalau API wilayah gagal diambil, otomatis jadi input teks biasa
 * supaya form tetap bisa dipakai.
 */
export default function WilayahSelect({
  value,
  onChange,
  className = "",
  required = false,
  placeholderKota = "Contoh: Bandung",
}: WilayahSelectProps) {
  const [mode, setMode] = useState<"loading" | "select" | "fallback">("loading");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [provinsiId, setProvinsiId] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [provRes, kotaRes] = await Promise.all([
          fetch(`${API_BASE}/wilayah/provinces`),
          fetch(`${API_BASE}/wilayah/regencies`),
        ]);
        if (!provRes.ok || !kotaRes.ok) throw new Error("gagal memuat wilayah");

        const [provData, kotaData]: [Province[], Regency[]] = await Promise.all([
          provRes.json(),
          kotaRes.json(),
        ]);

        if (cancelled) return;
        setProvinces(provData);
        setRegencies(kotaData);
        setMode("select");
      } catch {
        if (!cancelled) setMode("fallback");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sinkronkan provinsi dengan kota yang sudah tersimpan (data lama)
  useEffect(() => {
    if (mode !== "select" || !value) return;
    queueMicrotask(() => {
      const match = regencies.find(
        (r) => r.name.toLowerCase() === value.trim().toLowerCase()
      );
      if (match) setProvinsiId(match.provinceId);
    });
  }, [mode, value, regencies]);

  if (mode === "fallback") {
    return (
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderKota}
        className={className}
      />
    );
  }

  if (mode === "loading") {
    return (
      <div className={`${className} text-black/40`} aria-live="polite">
        Memuat data wilayah...
      </div>
    );
  }

  const kotaOptions = regencies.filter((r) => r.provinceId === provinsiId);
  const nilaiSaatIniDipakai =
    !!value &&
    !kotaOptions.some((r) => r.name === value.trim());

  const handleProvinsi = (id: string) => {
    setProvinsiId(id);
    const masihCocok = regencies.some(
      (r) => r.provinceId === id && r.name === value.trim()
    );
    if (value && !masihCocok) onChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      <select
        value={provinsiId}
        onChange={(e) => handleProvinsi(e.target.value)}
        className={className}
      >
        <option value="">— Pilih Provinsi —</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={value.trim()}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        required={required}
      >
        <option value="">
          {provinsiId ? "— Pilih Kota —" : "Pilih provinsi dahulu"}
        </option>
        {nilaiSaatIniDipakai && (
          <option value={value.trim()}>{value.trim()} (nilai saat ini)</option>
        )}
        {kotaOptions.map((r) => (
          <option key={r.id} value={r.name}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
