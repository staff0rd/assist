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
