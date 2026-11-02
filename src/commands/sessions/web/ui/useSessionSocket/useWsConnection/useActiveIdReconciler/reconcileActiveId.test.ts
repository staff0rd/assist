import { describe, expect, it } from "vitest";
import { reconcileActiveId } from "./reconcileActiveId";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";

describe("reconcileActiveId", () => {
	it("keeps the active card when it is still present", () => {
		const sessions = [
			makeSessionInfo({ id: "a" }),
			makeSessionInfo({ id: "b" }),
			makeSessionInfo({ id: "c" }),
		];
		expect(reconcileActiveId(sessions, "b")).toBe("b");
	});

	it("selects the top card when the active card was removed", () => {
		const sessions = [
			makeSessionInfo({ id: "a" }),
			makeSessionInfo({ id: "c" }),
		];
		expect(reconcileActiveId(sessions, "b")).toBe("a");
	});

	it("selects the next card when the removed active card was the top card", () => {
		const sessions = [
			makeSessionInfo({ id: "b" }),
			makeSessionInfo({ id: "c" }),
		];
		expect(reconcileActiveId(sessions, "a")).toBe("b");
	});

	it("clears selection when the removed active card was the last card", () => {
		expect(reconcileActiveId([], "a")).toBeNull();
	});

	it("selects the top card when nothing is selected and cards exist", () => {
		const sessions = [
			makeSessionInfo({ id: "a" }),
			makeSessionInfo({ id: "b" }),
		];
		expect(reconcileActiveId(sessions, null)).toBe("a");
	});

	it("leaves selection null when nothing is selected and no cards exist", () => {
		expect(reconcileActiveId([], null)).toBeNull();
	});

	describe("when the removed active card had repo siblings", () => {
		const other = makeSessionInfo({ id: "o", cwd: "/other" });
		const a1 = makeSessionInfo({ id: "a1", cwd: "/repo" });
		const a2 = makeSessionInfo({ id: "a2", cwd: "/repo" });
		const a3 = makeSessionInfo({ id: "a3", cwd: "/repo" });

		it("selects the sibling below the removed card", () => {
			const previous = [other, a1, a2, a3];
			expect(reconcileActiveId([other, a1, a3], "a2", null, previous)).toBe(
				"a3",
			);
		});

		it("selects the sibling above when the removed card was last in its group", () => {
			const previous = [other, a1, a2, a3];
			expect(reconcileActiveId([other, a1, a2], "a3", null, previous)).toBe(
				"a2",
			);
		});

		it("treats a worktree clone of the same origin as a sibling", () => {
			const repoGroup = { origin: "git@x:repo.git", clone: "/repo" };
			const main = makeSessionInfo({ id: "m", cwd: "/repo", repoGroup });
			const clone = makeSessionInfo({
				id: "c",
				cwd: "/repo-2",
				repoGroup: { ...repoGroup, clone: "/repo-2" },
			});
			expect(
				reconcileActiveId([other, clone], "m", null, [other, main, clone]),
			).toBe("c");
		});

		it("falls back to the top card when no sibling remains", () => {
			const previous = [other, a1];
			expect(reconcileActiveId([other], "a1", null, previous)).toBe("o");
		});
	});

	describe("when a daemon selection is provided", () => {
		it("adopts the daemon selection over the first card when nothing is selected", () => {
			const sessions = [
				makeSessionInfo({ id: "a" }),
				makeSessionInfo({ id: "b" }),
				makeSessionInfo({ id: "c" }),
			];
			expect(reconcileActiveId(sessions, null, "b")).toBe("b");
		});

		it("falls back to the first card when the daemon selection is gone", () => {
			const sessions = [
				makeSessionInfo({ id: "a" }),
				makeSessionInfo({ id: "b" }),
			];
			expect(reconcileActiveId(sessions, null, "x")).toBe("a");
		});

		it("keeps the local selection even when a daemon selection differs", () => {
			const sessions = [
				makeSessionInfo({ id: "a" }),
				makeSessionInfo({ id: "b" }),
				makeSessionInfo({ id: "c" }),
			];
			expect(reconcileActiveId(sessions, "c", "b")).toBe("c");
		});
	});
});
