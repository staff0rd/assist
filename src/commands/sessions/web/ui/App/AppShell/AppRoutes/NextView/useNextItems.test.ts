// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
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

	describe("switching repo", () => {
		type Pending = {
			url: string;
			resolve: (reply: { ok: boolean; json: () => Promise<unknown> }) => void;
		};

		function stubPendingFetch() {
			const pending: Pending[] = [];
			vi.stubGlobal(
				"fetch",
				vi.fn(
					(url: string) =>
						new Promise((resolve) => pending.push({ url, resolve })),
				),
			);
			const reply = (cwd: string, ok: boolean, body: unknown) =>
				act(async () => {
					const entry = pending.find((p) =>
						p.url.endsWith(encodeURIComponent(cwd)),
					);
					entry?.resolve({ ok, json: async () => body });
				});
			return reply;
		}

		function renderOn(cwd: string) {
			return renderHook(({ cwd }) => useNextItems(cwd), {
				initialProps: { cwd },
			});
		}

		it("drops the previous repo's data as soon as the repo changes", async () => {
			const reply = stubPendingFetch();
			const { result, rerender } = renderOn("/a");
			await reply("/a", true, { repo: "a" });
			expect(result.current.data).toEqual({ repo: "a" });
			rerender({ cwd: "/b" });
			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(true);
			await reply("/b", true, { repo: "b" });
			expect(result.current.data).toEqual({ repo: "b" });
			expect(result.current.loading).toBe(false);
		});

		it("ignores a late response for the previous repo", async () => {
			const reply = stubPendingFetch();
			const { result, rerender } = renderOn("/a");
			rerender({ cwd: "/b" });
			await reply("/a", true, { repo: "a" });
			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(true);
		});

		it("reports an error for the new repo instead of the old data", async () => {
			const reply = stubPendingFetch();
			const { result, rerender } = renderOn("/a");
			await reply("/a", true, { repo: "a" });
			rerender({ cwd: "/b" });
			await reply("/b", false, { error: "boom" });
			expect(result.current.data).toBeNull();
			expect(result.current.error).toBe("boom");
			expect(result.current.loading).toBe(false);
		});
	});
});
