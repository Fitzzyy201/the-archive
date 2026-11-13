type JwtPayload = {
  sub?: number;
  role?: string;
  exp?: number;
};

type RouterLike = { replace: (href: string) => void };

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
}

function getAdminAuthError(token: string | null): "missing" | "not-admin" | "expired" | "invalid" | null {
  if (!token) return "missing";

  const payload = decodeJwt(token);
  if (!payload) return "invalid";
  if (payload.role !== "Admin") return "not-admin";

  // Sesi admin berakhir 24 jam (JWT_EXPIRES_IN di backend).
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return "expired";
  }

  return null;
}

export function guardAdmin(router: RouterLike): boolean {
  const error = getAdminAuthError(localStorage.getItem("token"));

  if (!error) return true;

  // Akun non-admin tidak boleh kehilangan sesinya, cukup dialihkan.
  if (error !== "not-admin") {
    clearAdminSession();
  }
  router.replace("/admin-portal");
  return false;
}

export function handleAdminResponse(res: { status: number }, router: RouterLike): boolean {
  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    router.replace("/admin-portal");
    return false;
  }
  return true;
}
