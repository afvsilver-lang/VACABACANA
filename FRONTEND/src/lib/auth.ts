const TOKEN_KEY = "olinda_token";

export function obtenerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // almacenamiento no disponible (modo privado, etc.)
  }
}

export function borrarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // almacenamiento no disponible
  }
}
