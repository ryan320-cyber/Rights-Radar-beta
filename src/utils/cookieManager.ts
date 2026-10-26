/**
 * Browser Cookie Management Utility for Rights Radar
 * Provides secure, privacy-compliant handling of client-side cookies
 */

export interface CookieItem {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface CookieConsentState {
  essential: boolean;
  audioAndPerformance: boolean;
  localDossiers: boolean;
  updatedAt: string;
}

const CONSENT_COOKIE_NAME = 'rights_radar_consent';

export const setCookie = (
  name: string,
  value: string,
  days: number = 365,
  sameSite: 'Strict' | 'Lax' | 'None' = 'Lax',
  secure: boolean = true
) => {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const secureFlag = secure ? '; Secure' : '';
  const sameSiteFlag = `; SameSite=${sameSite}`;

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/${secureFlag}${sameSiteFlag}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=-99999999; path=/;`;
};

export const getAllCookies = (): CookieItem[] => {
  if (typeof document === 'undefined') return [];

  const raw = document.cookie;
  if (!raw || raw.trim() === '') return [];

  const hostname = window.location.hostname || 'localhost';

  return raw.split(';').map((pair) => {
    const parts = pair.split('=');
    const name = decodeURIComponent(parts[0].trim());
    const value = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('=').trim()) : '';

    return {
      name,
      value,
      domain: hostname,
      path: '/',
      expires: 'Session / 1 An',
      secure: window.isSecureContext,
      sameSite: 'Lax',
    };
  });
};

export const clearAllCookies = () => {
  if (typeof document === 'undefined') return;

  const cookies = getAllCookies();
  cookies.forEach((c) => {
    deleteCookie(c.name);
  });
};

// Consent Management Helpers
export const getCookieConsent = (): CookieConsentState | null => {
  const val = getCookie(CONSENT_COOKIE_NAME);
  if (!val) {
    // Try localStorage fallback
    try {
      const ls = localStorage.getItem('rights_radar_cookie_consent');
      if (ls) return JSON.parse(ls);
    } catch {}
    return null;
  }

  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

export const saveCookieConsent = (consent: CookieConsentState) => {
  const jsonStr = JSON.stringify(consent);
  setCookie(CONSENT_COOKIE_NAME, jsonStr, 365, 'Lax', true);

  // Sync to localStorage
  try {
    localStorage.setItem('rights_radar_cookie_consent', jsonStr);
  } catch {}

  // Apply or prune non-essential cookies based on consent
  if (!consent.audioAndPerformance) {
    deleteCookie('rights_radar_audio');
    deleteCookie('rights_radar_3d_perf');
  } else {
    setCookie('rights_radar_3d_perf', 'high', 180);
  }
};
