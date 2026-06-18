import { describe, expect, it } from "vitest";
import { reconcileActiveId } from "./reconcileActiveId";
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

describe("reconcileActiveId", () => {
	it("keeps the active card when it is still present", () => {
		const sessions = [session("a"), session("b"), session("c")];
		expect(reconcileActiveId(sessions, "b")).toBe("b");
	});

	it("selects the top card when the active card was removed", () => {
		const sessions = [session("a"), session("c")];
		expect(reconcileActiveId(sessions, "b")).toBe("a");
	});

	it("selects the next card when the removed active card was the top card", () => {
		const sessions = [session("b"), session("c")];
		expect(reconcileActiveId(sessions, "a")).toBe("b");
	});

	it("clears selection when the removed active card was the last card", () => {
		expect(reconcileActiveId([], "a")).toBeNull();
	});

	it("selects the top card when nothing is selected and cards exist", () => {
		const sessions = [session("a"), session("b")];
		expect(reconcileActiveId(sessions, null)).toBe("a");
	});

	it("leaves selection null when nothing is selected and no cards exist", () => {
		expect(reconcileActiveId([], null)).toBeNull();
	});

	describe("when a daemon selection is provided", () => {
		it("adopts the daemon selection over the first card when nothing is selected", () => {
			const sessions = [session("a"), session("b"), session("c")];
			expect(reconcileActiveId(sessions, null, "b")).toBe("b");
		});

		it("falls back to the first card when the daemon selection is gone", () => {
			const sessions = [session("a"), session("b")];
			expect(reconcileActiveId(sessions, null, "x")).toBe("a");
		});

		it("keeps the local selection even when a daemon selection differs", () => {
			const sessions = [session("a"), session("b"), session("c")];
			expect(reconcileActiveId(sessions, "c", "b")).toBe("c");
		});
	});
});
