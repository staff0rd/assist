import { describe, expect, it, vi } from "vitest";
import { applyToggle, checkStarred } from "./useStarredKeys";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

describe("checkStarred", () => {
	it("counts a backlog session as starred when its key is in the set", () => {
		const s = makeSessionInfo({
			cwd: "/repo",
			activity: { kind: "backlog", itemId: 7, startedAt: 0 },
		});
		expect(checkStarred(new Set(["/repo::7"]), s)).toBe(true);
		expect(checkStarred(new Set(), s)).toBe(false);
	});

	it("falls back to the session record flag for an item-less session", () => {
		expect(checkStarred(new Set(), makeSessionInfo({ starred: true }))).toBe(
			true,
		);
		expect(checkStarred(new Set(), makeSessionInfo({ starred: false }))).toBe(
			false,
		);
		expect(checkStarred(new Set(), makeSessionInfo())).toBe(false);
	});
});

describe("applyToggle", () => {
	it("toggles the session record for an item-less session", () => {
		const setSessionStarred = vi.fn();
		const setKeys = vi.fn();
		applyToggle(
			setKeys,
			setSessionStarred,
			makeSessionInfo({ id: "9", starred: false }),
		);
		expect(setSessionStarred).toHaveBeenCalledWith("9", true);
		expect(setKeys).not.toHaveBeenCalled();
	});

	it("unstars a starred item-less session", () => {
		const setSessionStarred = vi.fn();
		applyToggle(
			vi.fn(),
			setSessionStarred,
			makeSessionInfo({ id: "9", starred: true }),
		);
		expect(setSessionStarred).toHaveBeenCalledWith("9", false);
	});

	it("uses the key-set path for a backlog session", () => {
		const setSessionStarred = vi.fn();
		const setKeys = vi.fn();
		applyToggle(
			setKeys,
			setSessionStarred,
			makeSessionInfo({
				cwd: "/repo",
				activity: { kind: "backlog", itemId: 7, startedAt: 0 },
			}),
		);
		expect(setKeys).toHaveBeenCalled();
		expect(setSessionStarred).not.toHaveBeenCalled();
	});
});
