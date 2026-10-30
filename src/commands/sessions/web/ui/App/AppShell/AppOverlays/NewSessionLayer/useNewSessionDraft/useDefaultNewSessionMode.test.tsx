// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { NewSessionMode } from "../newSessionModes";
import { useDefaultNewSessionMode } from "./useDefaultNewSessionMode";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

function stubMode(mode: NewSessionMode) {
	const fetch = vi.fn(async () => Response.json({ mode }));
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

it("fetches only the selected repo's mode", async () => {
	const fetch = stubMode("prompt");
	const { result } = renderHook(() => useDefaultNewSessionMode("/git/apm"));
	await act(async () => {});

	expect(result.current).toEqual({ mode: "prompt", pending: false });
	expect(fetch).toHaveBeenCalledOnce();
	expect(fetch).toHaveBeenCalledWith(
		"/api/new-session-defaults?cwd=%2Fgit%2Fapm",
		undefined,
	);
});

it("refetches the selected repo's mode each time the dialog opens", async () => {
	stubMode("draft");
	const { result, rerender } = renderHook(
		({ opens }) => useDefaultNewSessionMode("/git/apm", opens),
		{ initialProps: { opens: 0 } },
	);
	await act(async () => {});

	const fetch = stubMode("prompt");
	rerender({ opens: 1 });
	expect(result.current?.pending).toBe(true);

	await act(async () => {});
	expect(result.current).toEqual({ mode: "prompt", pending: false });
	expect(fetch).toHaveBeenCalledOnce();
});

it("does not refetch when nothing changes", async () => {
	const fetch = stubMode("draft");
	const { rerender } = renderHook(
		({ opens }) => useDefaultNewSessionMode("/git/apm", opens),
		{ initialProps: { opens: 1 } },
	);
	await act(async () => {});

	rerender({ opens: 1 });
	await act(async () => {});

	expect(fetch).toHaveBeenCalledOnce();
});

it("stays pending and retries a failed fetch instead of guessing draft", async () => {
	vi.useFakeTimers();
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => {
			throw new Error("offline");
		}),
	);
	const { result } = renderHook(() => useDefaultNewSessionMode("/git/apm"));
	await act(async () => {});
	expect(result.current).toBeNull();

	stubMode("prompt");
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1000);
	});
	expect(result.current).toEqual({ mode: "prompt", pending: false });
});
