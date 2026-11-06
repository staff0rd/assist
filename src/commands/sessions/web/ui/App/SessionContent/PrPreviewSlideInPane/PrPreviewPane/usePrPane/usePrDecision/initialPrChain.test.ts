// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { initialPrChain } from "./initialPrChain";

const on = { draft: false, reviewAfter: true };
const off = { draft: false, reviewAfter: false };

function saveChain(sessionId: string, chain: Record<string, boolean>) {
	localStorage.setItem(
		`assist:pr-preview-chain:${sessionId}`,
		JSON.stringify({ savedAt: Date.now(), items: [chain] }),
	);
}

afterEach(() => {
	localStorage.clear();
});

describe("initialPrChain", () => {
	it("starts Review PR unchecked when the default is off", () => {
		expect(initialPrChain(true, "s1", off).reviewAfter).toBe(false);
	});

	it("starts Review PR checked when the default is on", () => {
		expect(initialPrChain(true, "s1", on).reviewAfter).toBe(true);
	});

	it("prefers a saved session choice over the default", () => {
		saveChain("s1", { reviewAfter: true });
		expect(initialPrChain(true, "s1", off).reviewAfter).toBe(true);

		saveChain("s2", { reviewAfter: false });
		expect(initialPrChain(true, "s2", on).reviewAfter).toBe(false);
	});

	it("falls back to the default when the saved chain omits Review PR", () => {
		saveChain("s1", { announceAfter: false });
		expect(initialPrChain(true, "s1", off).reviewAfter).toBe(false);
	});

	it("chains nothing for a non-PR preview", () => {
		expect(initialPrChain(false, "s1", on).reviewAfter).toBe(false);
	});
});
