export interface Session {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  token: string;
  expiresAt: number;
}

const STORAGE_KEY = "tirbeo_session";

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exchangeCode(code: string): Promise<Session> {
  // Simulate code exchange — in production this calls the token endpoint
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code.startsWith("mock_") || code.startsWith("mock_auth_") || code.startsWith("mock_oauth_")) {
        resolve({
          user: {
            id: crypto.randomUUID?.() ?? "user_" + Date.now(),
            email: "user@tirbeo.com",
            username: "tirbeouser",
            displayName: "Tirbeo User",
            avatarUrl: undefined,
          },
          token: "jwt_" + code + "_" + Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      } else {
        reject(new Error("Invalid authorization code"));
      }
    }, 800);
  });
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function encodeSession(session: Session): string {
  return btoa(JSON.stringify(session));
}

export function decodeSession(encoded: string): Session | null {
  try {
    return JSON.parse(atob(encoded)) as Session;
  } catch {
    return null;
  }
}
