import { describe, expect, it } from "vitest";
import { REPLAY_WINDOW_SECONDS, sign, signatureHeader, verify } from "@/lib/signing";
import vectors from "../fixtures/signing-vectors.json";

/* Byte-compatible with the theme's progressnow_rebuild_sign() /
 * progressnow_rebuild_verify() (openspec next-revalidation-receiver § Signed
 * request verification, § Test vectors from the PHP scheme). */
describe("sign", () => {
  it.each(vectors.vectors.map((v) => [v.name, v]))("matches the PHP vector: %s", (_name, v) => {
    expect(sign(v.body, v.timestamp, v.secret)).toBe(v.signature);
    expect(signatureHeader(v.body, v.timestamp, v.secret)).toBe(`sha256=${v.signature}`);
  });
});

describe("verify", () => {
  const v = vectors.vectors[0]!;
  const now = Number(v.timestamp) + 10;

  it("accepts a valid signature with or without the sha256= prefix, case-insensitively", () => {
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: `sha256=${v.signature}`,
        secret: v.secret,
        now,
      }),
    ).toEqual({ ok: true });
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: v.signature.toUpperCase(),
        secret: v.secret,
        now,
      }),
    ).toEqual({ ok: true });
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: ` SHA256=${v.signature} `,
        secret: v.secret,
        now,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects a stale or future timestamp outside ±300 s", () => {
    expect(REPLAY_WINDOW_SECONDS).toBe(300);
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: v.signature,
        secret: v.secret,
        now: Number(v.timestamp) + 301,
      }),
    ).toEqual({ ok: false, reason: "stale" });
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: v.signature,
        secret: v.secret,
        now: Number(v.timestamp) - 301,
      }),
    ).toEqual({ ok: false, reason: "stale" });
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: v.signature,
        secret: v.secret,
        now: Number(v.timestamp) + 300,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects malformed timestamps (9–11 digits only)", () => {
    for (const timestamp of [
      "",
      "abc",
      "12345678",
      "123456789012",
      "1788604800.5",
      " 1788604800",
    ]) {
      expect(
        verify({ body: v.body, timestamp, signature: v.signature, secret: v.secret, now }),
      ).toEqual({ ok: false, reason: "timestamp" });
    }
  });

  it("rejects a wrong secret, a tampered body, and malformed signatures", () => {
    expect(
      verify({
        body: v.body,
        timestamp: v.timestamp,
        signature: v.signature,
        secret: "another-secret-entirely",
        now,
      }),
    ).toEqual({ ok: false, reason: "signature" });
    expect(
      verify({
        body: v.body + " ",
        timestamp: v.timestamp,
        signature: v.signature,
        secret: v.secret,
        now,
      }),
    ).toEqual({ ok: false, reason: "signature" });
    for (const signature of [
      "",
      "sha256=",
      "sha256=zz",
      `sha1=${v.signature}`,
      v.signature.slice(0, 63),
    ]) {
      expect(
        verify({ body: v.body, timestamp: v.timestamp, signature, secret: v.secret, now }),
      ).toEqual({ ok: false, reason: "signature" });
    }
  });

  it("refuses to verify without a secret", () => {
    expect(
      verify({ body: v.body, timestamp: v.timestamp, signature: v.signature, secret: "", now }),
    ).toEqual({ ok: false, reason: "secret" });
  });
});
