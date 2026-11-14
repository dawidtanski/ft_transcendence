import "server-only";
import { NextResponse } from "next/server";
import { getAuthConfig } from "./config";

export class AuthHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AuthHttpError";
  }
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function requireSameOriginJson(request: Request): void {
  // A configured origin, not a browser-supplied Host/X-Forwarded-Host value.
  if (request.headers.get("origin") !== getAuthConfig().origin ||
      request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AuthHttpError(403, "Request origin is not allowed.");
  }
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new AuthHttpError(415, "Use application/json.");
  }
}

export async function readSmallJson(request: Request): Promise<unknown> {
  const maxBytes = 4096;
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new AuthHttpError(413, "Request is too large.");
  if (!request.body) throw new AuthHttpError(400, "A JSON body is required.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new AuthHttpError(413, "Request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    const bytes = Buffer.concat(chunks);
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new AuthHttpError(400, "Invalid JSON.");
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthHttpError) {
    const response = jsonResponse({ error: error.message }, error.status);
    if (error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter));
    return response;
  }
  // Avoid logging request bodies, SQL parameters, secrets, or entire DB errors.
  console.error("Authentication operation failed", {
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
  return jsonResponse({ error: "Authentication is temporarily unavailable." }, 503);
}