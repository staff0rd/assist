import { describe, expect, it, vi } from "vitest";
import { applyToggle, checkStarred } from "./useStarredKeys";
import type { SessionInfo } from "./types";

function session(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "s",
		commandType: "run",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("checkStarred", () => {
	it("counts a backlog session as starred when its key is in the set", () => {
		const s = session({
			cwd: "/repo",
			activity: { kind: "backlog", itemId: 7, startedAt: 0 },
		});
		expect(checkStarred(new Set(["/repo::7"]), s)).toBe(true);
		expect(checkStarred(new Set(), s)).toBe(false);
	});

	it("falls back to the session record flag for an item-less session", () => {
		expect(checkStarred(new Set(), session({ starred: true }))).toBe(true);
		expect(checkStarred(new Set(), session({ starred: false }))).toBe(false);
		expect(checkStarred(new Set(), session({}))).toBe(false);
	});
});

describe("applyToggle", () => {
	it("toggles the session record for an item-less session", () => {
		const setSessionStarred = vi.fn();
		const setKeys = vi.fn();
		applyToggle(
			setKeys,
			setSessionStarred,
			session({ id: "9", starred: false }),
		);
		expect(setSessionStarred).toHaveBeenCalledWith("9", true);
		expect(setKeys).not.toHaveBeenCalled();
	});

	it("unstars a starred item-less session", () => {
		const setSessionStarred = vi.fn();
		applyToggle(
			vi.fn(),
			setSessionStarred,
			session({ id: "9", starred: true }),
		);
		expect(setSessionStarred).toHaveBeenCalledWith("9", false);
	});

	it("uses the key-set path for a backlog session", () => {
		const setSessionStarred = vi.fn();
		const setKeys = vi.fn();
		applyToggle(
			setKeys,
			setSessionStarred,
			session({
				cwd: "/repo",
				activity: { kind: "backlog", itemId: 7, startedAt: 0 },
			}),
		);
		expect(setKeys).toHaveBeenCalled();
		expect(setSessionStarred).not.toHaveBeenCalled();
	});
});
