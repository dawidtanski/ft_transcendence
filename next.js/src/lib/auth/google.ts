import * as client from "openid-client";

const issuerUrl = new URL("https://accounts.google.com");

let cachedConfig: client.Configuration | null = null;

export async function getGoogleConfig(): Promise<client.Configuration> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Brak zmiennych GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET");
  }

  cachedConfig = await client.discovery(issuerUrl, clientId, clientSecret);
  return cachedConfig;
}
