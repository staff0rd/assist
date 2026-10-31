import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./apiFetch";
import { recordClientFailure } from "./clientFailures/recordClientFailure";

vi.mock("./clientFailures/recordClientFailure", () => ({
	recordClientFailure: vi.fn(),
}));

const recordMock = vi.mocked(recordClientFailure);

beforeEach(() => {
	vi.stubGlobal("location", new URL("http://localhost:3100/"));
});

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("apiFetch", () => {
	it("records nothing for a successful response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("{}")),
		);
		const res = await apiFetch("/api/health");
		expect(res.ok).toBe(true);
		expect(recordMock).not.toHaveBeenCalled();
	});

	it("records a non-2xx response with method, path, node and status", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response("{}", { status: 502, statusText: "Bad Gateway" }),
			),
		);
		const res = await apiFetch("/api/file?node=mac", { method: "post" });
		expect(res.status).toBe(502);
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "POST",
				path: "/api/file?node=mac",
				base: "http://localhost:3100",
				node: "mac",
				status: 502,
				error: "Bad Gateway",
				durationMs: expect.any(Number),
			}),
		);
	});

	it("records and rethrows a network error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new TypeError("Failed to fetch");
			}),
		);
		await expect(apiFetch("/api/items")).rejects.toThrow("Failed to fetch");
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({ path: "/api/items", error: "Failed to fetch" }),
		);
	});

	it("times out a hung request after the per-call limit and records it", async () => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"fetch",
			vi.fn(
				(_url: string, init: RequestInit) =>
					new Promise((_resolve, reject) =>
						init.signal?.addEventListener("abort", () =>
							reject(init.signal?.reason),
						),
					),
			),
		);
		const pending = apiFetch("/api/new-session-defaults", { timeoutMs: 5000 });
		const assertion = expect(pending).rejects.toMatchObject({
			name: "TimeoutError",
		});
		await vi.advanceTimersByTimeAsync(5000);
		await assertion;
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({ error: "timed out after 5s" }),
		);
	});

	it("does not record a request the caller cancelled", async () => {
		const controller = new AbortController();
		vi.stubGlobal(
			"fetch",
			vi.fn(
				(_url: string, init: RequestInit) =>
					new Promise((_resolve, reject) =>
						init.signal?.addEventListener("abort", () =>
							reject(init.signal?.reason),
						),
					),
			),
		);
		const pending = apiFetch("/api/files", { signal: controller.signal });
		controller.abort();
		await expect(pending).rejects.toMatchObject({ name: "AbortError" });
		expect(recordMock).not.toHaveBeenCalled();
	});

	it("skips recording when capture is off", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("", { status: 503 })),
		);
		await apiFetch("/api/health", { capture: false });
		expect(recordMock).not.toHaveBeenCalled();
	});
});
