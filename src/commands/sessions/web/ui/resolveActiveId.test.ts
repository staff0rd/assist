import { describe, expect, it } from "vitest";
import { resolveActiveId } from "./resolveActiveId";
import type { SessionInfo } from "./types";

function session(id: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status: "running",
		startedAt: 0,
	};
}

describe("resolveActiveId", () => {
	it("returns null when there are no selections", () => {
		expect(resolveActiveId({}, [session("a"), session("b")])).toBeNull();
	});

	describe("when a single selection's session is live", () => {
		it("returns that session id", () => {
			const active = { "/repo": "b" };
			expect(resolveActiveId(active, [session("a"), session("b")])).toBe("b");
		});
	});

	describe("when the selection's session no longer exists", () => {
		it("returns null", () => {
			const active = { "/repo": "x" };
			expect(resolveActiveId(active, [session("a"), session("b")])).toBeNull();
		});
	});

	describe("when several repos have live selections", () => {
		it("returns the most recently selected (last) one", () => {
			const active = { "/one": "a", "/two": "b" };
			expect(resolveActiveId(active, [session("a"), session("b")])).toBe("b");
		});
	});

	describe("when the most recent selection's session is gone", () => {
		it("returns the most recent selection that is still live", () => {
			const active = { "/one": "a", "/two": "gone" };
			expect(resolveActiveId(active, [session("a"), session("b")])).toBe("a");
		});
	});
});
