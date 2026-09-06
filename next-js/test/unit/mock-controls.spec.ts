import { describe, expect, it } from "vitest";
import { createMock } from "../mock/api.mjs";

/* The mock's e2e control surface (openspec next-test-harness § Fixture-backed
 * mock API). `setDelay` backs `POST /__mock/delay`, which opens a route's
 * loading window on demand — the footer-hold e2e is only meaningful while the
 * knob works, so a silently-ignored value would make that test pass vacuously.
 * The HTTP round trip is asserted in test/e2e/chrome.spec.ts. */
describe("mock control surface: delay", () => {
  it("starts at zero and takes a non-negative number of milliseconds", () => {
    const mock = createMock();
    expect(mock.delayMs).toBe(0);

    expect(mock.setDelay(750)).toBe(true);
    expect(mock.delayMs).toBe(750);

    expect(mock.setDelay(0)).toBe(true);
    expect(mock.delayMs).toBe(0);
  });

  it("applies only to envelopes under the given path prefix", () => {
    // The mock is shared by specs running in parallel; an unscoped delay would slow
    // the routes another spec is timing.
    const mock = createMock();
    mock.setDelay(600, "posts");

    expect(mock.isDelayed("posts")).toBe(true);
    expect(mock.isDelayed("posts/contract-test-post")).toBe(true);
    expect(mock.isDelayed("site")).toBe(false);
    expect(mock.isDelayed("events")).toBe(false);
  });

  it("defaults to every envelope when no prefix is given, and never delays at zero", () => {
    const mock = createMock();
    mock.setDelay(600);
    expect(mock.isDelayed("site")).toBe(true);
    expect(mock.isDelayed("events")).toBe(true);

    mock.setDelay(0);
    expect(mock.isDelayed("site")).toBe(false);
  });

  it("rejects values that would silently disable the knob", () => {
    const mock = createMock();
    mock.setDelay(500);

    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY, "500", null, undefined, {}]) {
      expect(mock.setDelay(bad), `${String(bad)} should be rejected`).toBe(false);
    }
    expect(mock.setDelay(100, 42), "a non-string path should be rejected").toBe(false);
    expect(mock.delayMs).toBe(500);
  });

  it("is cleared by reset, with the other overlays", () => {
    const mock = createMock();
    mock.setDelay(500, "posts");
    mock.setFailing(true);
    mock.setCanonicalOrigin("https://canonical.example");

    mock.reset();

    expect(mock.delayMs).toBe(0);
    expect(mock.delayPath).toBe("");
    expect(mock.failing).toBe(false);
  });
});
