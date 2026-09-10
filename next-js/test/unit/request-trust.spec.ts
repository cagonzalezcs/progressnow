import { describe, expect, it } from "vitest";
import {
  ERROR_RENDER_HEADER,
  INTERNAL_HEADERS,
  INTERNAL_TOKEN,
  INTERNAL_TOKEN_HEADER,
  isTrustedInternal,
  NONCE_HEADER,
  NOT_FOUND_RENDER_HEADER,
  PATHNAME_HEADER,
  stripInternalHeaders,
} from "@/lib/request-path";

/* Internal render authentication (openspec next-edge-trust-boundaries
 * § Internal render headers are not honored from the public edge): the proxy
 * strips x-nonce / x-pathname / x-not-found-render / x-error-render unless the
 * request carries the process's internal token. */
const spoofed = () =>
  new Headers({
    [NONCE_HEADER]: "AAAA",
    [PATHNAME_HEADER]: "/es/",
    [NOT_FOUND_RENDER_HEADER]: "1",
    [ERROR_RENDER_HEADER]: "1",
    accept: "text/html",
    "accept-language": "es",
  });

describe("INTERNAL_TOKEN", () => {
  it("is a 32-byte hex secret", () => {
    expect(INTERNAL_TOKEN).toMatch(/^[0-9a-f]{64}$/);
  });

  it("names exactly the four render-steering headers", () => {
    expect([...INTERNAL_HEADERS]).toEqual([
      "x-nonce",
      "x-pathname",
      "x-not-found-render",
      "x-error-render",
    ]);
  });
});

describe("isTrustedInternal", () => {
  it("accepts only the exact token", () => {
    expect(
      isTrustedInternal({ headers: new Headers({ [INTERNAL_TOKEN_HEADER]: INTERNAL_TOKEN }) }),
    ).toBe(true);
    expect(isTrustedInternal({ headers: new Headers() })).toBe(false);
    expect(isTrustedInternal({ headers: new Headers({ [INTERNAL_TOKEN_HEADER]: "" }) })).toBe(
      false,
    );
    expect(
      isTrustedInternal({
        headers: new Headers({ [INTERNAL_TOKEN_HEADER]: INTERNAL_TOKEN.slice(1) }),
      }),
    ).toBe(false);
    // Flip the last hex digit rather than hard-coding one: the token is random
    // per process, so a fixed replacement matches the real token 1 run in 16.
    const lastFlipped = INTERNAL_TOKEN.endsWith("0") ? "1" : "0";
    expect(
      isTrustedInternal({
        headers: new Headers({
          [INTERNAL_TOKEN_HEADER]: `${INTERNAL_TOKEN.slice(0, -1)}${lastFlipped}`,
        }),
      }),
    ).toBe(false);
    // Same length, different bytes — the constant-time path, not the length short-circuit.
    expect(
      isTrustedInternal({ headers: new Headers({ [INTERNAL_TOKEN_HEADER]: "f".repeat(64) }) }),
    ).toBe(false);
    // A token from another process/secret is never trusted.
    expect(
      isTrustedInternal(
        { headers: new Headers({ [INTERNAL_TOKEN_HEADER]: INTERNAL_TOKEN }) },
        "0".repeat(64),
      ),
    ).toBe(false);
  });
});

describe("stripInternalHeaders", () => {
  it("drops every spoofed internal header (and the token) and keeps the rest", () => {
    const h = spoofed();
    h.set(INTERNAL_TOKEN_HEADER, "guess");
    stripInternalHeaders(h);
    for (const name of INTERNAL_HEADERS) expect(h.has(name), name).toBe(false);
    expect(h.has(INTERNAL_TOKEN_HEADER)).toBe(false);
    expect(h.get("accept")).toBe("text/html");
    expect(h.get("accept-language")).toBe("es");
  });

  it("models the proxy: untrusted → stripped, trusted loop → preserved", () => {
    const untrusted = spoofed();
    if (!isTrustedInternal({ headers: untrusted })) stripInternalHeaders(untrusted);
    expect(untrusted.has(NOT_FOUND_RENDER_HEADER)).toBe(false);
    expect(untrusted.get(NONCE_HEADER)).toBeNull();

    const trusted = spoofed();
    trusted.set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);
    if (!isTrustedInternal({ headers: trusted })) stripInternalHeaders(trusted);
    expect(trusted.get(NOT_FOUND_RENDER_HEADER)).toBe("1");
    expect(trusted.get(NONCE_HEADER)).toBe("AAAA");
    expect(trusted.get(PATHNAME_HEADER)).toBe("/es/");
    expect(trusted.get(ERROR_RENDER_HEADER)).toBe("1");
  });
});
