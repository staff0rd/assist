// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NewSessionMode } from "../newSessionModes";
import { useSubmitLabel } from "./useSubmitLabel";

function key(type: "keydown" | "keyup", shiftKey: boolean) {
	act(() => {
		globalThis.dispatchEvent(
			new KeyboardEvent(type, { key: "Shift", shiftKey }),
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
});
