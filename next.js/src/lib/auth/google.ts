import "server-only";

import * as client from "openid-client";

const issuerUrl = new URL("https://accounts.google.com");

let configPromise: Promise<client.Configuration> | undefined;

export function getGoogleConfig(): Promise<client.Configuration> {
  if (configPromise) {
    return configPromise;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables");
  }

  configPromise = client
    .discovery(issuerUrl, clientId, clientSecret)
    .catch((error) => {
      configPromise = undefined;
      throw error;
    });

  return configPromise;
}

export function getGoogleRedirectUri(): string {
  const value = process.env.GOOGLE_REDIRECT_URI;

  if (!value) {
    throw new Error("Missing GOOGLE_REDIRECT_URI");
  }

  const url = new URL(value);

  if (
    url.protocol !== "https:" ||
    url.pathname !== "/api/auth/google/callback" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("Invalid GOOGLE_REDIRECT_URI");
  }

  return url.href;
}

export function appUrl(path: string): URL {
  const redirectUri = new URL(getGoogleRedirectUri());

  return new URL(path, redirectUri.origin);
}