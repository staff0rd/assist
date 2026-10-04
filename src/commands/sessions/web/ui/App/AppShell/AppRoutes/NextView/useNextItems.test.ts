// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNextItems } from "./useNextItems";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("useNextItems", () => {
	it("bounds the request with a timeout signal", async () => {
		const fetchMock = vi.fn(() =>
			Promise.resolve({ ok: true, json: async () => ({}) }),
		);
		vi.stubGlobal("fetch", fetchMock);
		const { result } = renderHook(() => useNextItems("/repo"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(fetchMock).toHaveBeenCalledWith("/api/next?cwd=%2Frepo", {
			signal: expect.any(AbortSignal),
		});
	});

	it("stops loading and reports an error when the request times out", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.reject(new DOMException("aborted", "TimeoutError"))),
		);
		const { result } = renderHook(() => useNextItems("/repo"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe("No response after 30s.");
		expect(result.current.data).toBeNull();
	});
});
