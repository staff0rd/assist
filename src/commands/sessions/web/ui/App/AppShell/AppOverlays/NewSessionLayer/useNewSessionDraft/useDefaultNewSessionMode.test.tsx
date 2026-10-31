// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
	clearClientFailures,
	getClientFailures,
} from "../../../../../clientFailures/recordClientFailure";
import type { NewSessionMode } from "../newSessionModes";
import { useDefaultNewSessionMode } from "./useDefaultNewSessionMode";

afterEach(() => {
	cleanup();
	clearClientFailures();
	vi.unstubAllGlobals();
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

	expect(result.current).toMatchObject({
		mode: "prompt",
		pending: false,
		error: undefined,
	});
	expect(fetch).toHaveBeenCalledOnce();
	expect(fetch).toHaveBeenCalledWith(
		"/api/new-session-defaults?cwd=%2Fgit%2Fapm",
		expect.anything(),
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
	expect(result.current).toMatchObject({
		mode: "prompt",
		pending: false,
		error: undefined,
	});
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

it("surfaces and reports a failed fetch instead of retrying silently", async () => {
	const failing = vi.fn(async () => new Response("", { status: 502 }));
	vi.stubGlobal("fetch", failing);
	const { result } = renderHook(() => useDefaultNewSessionMode("/git/apm"));
	await act(async () => {});

	expect(result.current).toMatchObject({ pending: false, error: "HTTP 502" });
	expect(failing).toHaveBeenCalledOnce();
	expect(getClientFailures()[0]).toMatchObject({
		path: "/api/new-session-defaults?cwd=%2Fgit%2Fapm",
		status: 502,
	});

	stubMode("draft");
	await act(async () => result.current?.retry?.());
	expect(result.current).toMatchObject({
		mode: "draft",
		pending: false,
		error: undefined,
	});
});

it("reports an unreadable response body", async () => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response("<html>")),
	);
	const { result } = renderHook(() => useDefaultNewSessionMode("/git/apm"));
	await act(async () => {});

	expect(result.current?.error).toBeDefined();
	expect(getClientFailures()[0]).toMatchObject({ kind: "caught" });
});
