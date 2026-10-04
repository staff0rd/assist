import { describe, expect, it } from "vitest";
import { peerVersionDrift } from "./peerVersionDrift";

describe("peerVersionDrift", () => {
	it("is behind when the peer's release is older", () => {
		expect(peerVersionDrift("0.759.1", "0.760.0")).toBe("behind");
	});

	it("is ahead when the peer's release is newer", () => {
		expect(peerVersionDrift("0.760.0", "0.759.9")).toBe("ahead");
	});

	it("compares segments numerically", () => {
		expect(peerVersionDrift("0.10.0", "0.9.0")).toBe("ahead");
	});

	it("has no drift when versions match or either is unknown", () => {
		expect(peerVersionDrift("0.760.0", "0.760.0")).toBeUndefined();
		expect(peerVersionDrift(undefined, "0.760.0")).toBeUndefined();
		expect(peerVersionDrift("0.760.0", undefined)).toBeUndefined();
	});

	it("ignores unparseable versions", () => {
		expect(peerVersionDrift("dev", "0.760.0")).toBeUndefined();
	});
});
