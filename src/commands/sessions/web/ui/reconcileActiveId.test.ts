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

	it("leaves an absent selection untouched", () => {
		const sessions = [session("a"), session("b")];
		expect(reconcileActiveId(sessions, null)).toBeNull();
	});
});
