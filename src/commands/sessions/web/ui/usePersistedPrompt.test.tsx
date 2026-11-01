// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersistedPrompt } from "./usePersistedPrompt";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("usePersistedPrompt", () => {
	it("restores a typed prompt after a remount", () => {
		const first = renderHook(() => usePersistedPrompt("new-session"));
		act(() => first.result.current[1]("long unsent prompt"));
		first.unmount();

		const second = renderHook(() => usePersistedPrompt("new-session"));
		expect(second.result.current[0]).toBe("long unsent prompt");
	});

	it("removes the saved draft when the prompt is cleared", () => {
		const { result } = renderHook(() => usePersistedPrompt("new-session"));
		act(() => result.current[1]("draft"));
		act(() => result.current[1](""));

		expect(localStorage.length).toBe(0);
		const again = renderHook(() => usePersistedPrompt("new-session"));
		expect(again.result.current[0]).toBe("");
	});

	it("keeps drafts separate per scope", () => {
		const a = renderHook(() => usePersistedPrompt("add-agent:1"));
		act(() => a.result.current[1]("for session 1"));

		const b = renderHook(() => usePersistedPrompt("add-agent:2"));
		expect(b.result.current[0]).toBe("");
	});

	it("switches to the new scope's draft when the scope changes", () => {
		const a = renderHook(() => usePersistedPrompt("add-agent:1"));
		act(() => a.result.current[1]("for session 1"));

		const { result, rerender } = renderHook(
			({ scope }) => usePersistedPrompt(scope),
			{ initialProps: { scope: "add-agent:2" } },
		);
		expect(result.current[0]).toBe("");
		rerender({ scope: "add-agent:1" });
		expect(result.current[0]).toBe("for session 1");
	});

	it("works when browser storage throws", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("denied");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("denied");
		});
		const { result } = renderHook(() => usePersistedPrompt("new-session"));

		expect(result.current[0]).toBe("");
		act(() => result.current[1]("still typing"));
		expect(result.current[0]).toBe("still typing");
	});
});
