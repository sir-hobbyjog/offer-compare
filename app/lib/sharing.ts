import { ComparisonState } from "./types";

export function encodeState(state: ComparisonState): string {
  const json = JSON.stringify(state);
  // Use base64url encoding for URL safety
  if (typeof window !== "undefined") {
    const encoded = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    // Make URL-safe
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return "";
}

export function decodeState(encoded: string): ComparisonState | null {
  try {
    // Restore from URL-safe base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4) {
      base64 += "=";
    }
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as ComparisonState;
  } catch {
    return null;
  }
}

export function generateShareUrl(state: ComparisonState): string {
  const encoded = encodeState(state);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${window.location.pathname}?d=${encoded}`;
  }
  return "";
}
