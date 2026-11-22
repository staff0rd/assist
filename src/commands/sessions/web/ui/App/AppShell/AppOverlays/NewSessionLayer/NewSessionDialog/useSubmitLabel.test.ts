// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NewSessionMode } from "../newSessionModes";
import { useSubmitLabel } from "./useSubmitLabel";

function key(type: "keydown" | "keyup", shiftKey: boolean, ctrlKey = false) {
	act(() => {
		globalThis.dispatchEvent(
			new KeyboardEvent(type, { key: "Shift", shiftKey, ctrlKey }),
		);
	});
}

describe("useSubmitLabel", () => {
	it.each([
		["draft", "Start draft", "Start draft + auto start"],
		["bug", "File bug", "File bug + auto start"],
	] as const)("swaps the %s label while Shift is held", (mode, plain, held) => {
		const { result } = renderHook(() => useSubmitLabel("repo", mode));
		expect(result.current).toBe(plain);

		key("keydown", true);
		expect(result.current).toBe(held);

		key("keyup", false);
		expect(result.current).toBe(plain);

		key("keydown", true);
		act(() => {
			globalThis.dispatchEvent(new Event("blur"));
		});
		expect(result.current).toBe(plain);
	});

	it.each([
		["repo", "prompt", "Start session"],
		["repo", "design", "Start design"],
		["clone", "draft", "Clone"],
		["clone", "bug", "Clone"],
	] as const)(
		"keeps the %s/%s label while Shift is held",
		(target, mode, label) => {
			const { result } = renderHook(() =>
				useSubmitLabel(target, mode as NewSessionMode),
			);

			key("keydown", true);

			expect(result.current).toBe(label);
		},
	);

	it.each([
		["draft", "Start draft + auto start + yolo"],
		["bug", "File bug + auto start + yolo"],
		["prompt", "Start session + yolo"],
		["design", "Start design + yolo"],
	] as const)(
		"adds + yolo to the %s label while Shift+Ctrl is held",
		(mode, held) => {
			const { result } = renderHook(() => useSubmitLabel("repo", mode));

			key("keydown", true, true);
			expect(result.current).toBe(held);

			key("keyup", true, false);
			expect(result.current).not.toContain("yolo");
		},
	);

	it("keeps the plain label while only Ctrl is held", () => {
		const { result } = renderHook(() => useSubmitLabel("repo", "draft"));

		key("keydown", false, true);

		expect(result.current).toBe("Start draft");
	});

	it("keeps Clone while Shift+Ctrl is held", () => {
		const { result } = renderHook(() => useSubmitLabel("clone", "draft"));

		key("keydown", true, true);

		expect(result.current).toBe("Clone");
	});
});
