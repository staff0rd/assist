import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./apiFetch";
import { recordClientFailure } from "./clientFailures/recordClientFailure";
import { createProxyBlipGate } from "./createProxyBlipGate";

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

	it("records the server's JSON error and the forward's trace id", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				Response.json(
					{ error: "work-win unreachable: connect ECONNREFUSED" },
					{
						status: 502,
						statusText: "Bad Gateway",
						headers: { "x-assist-trace-id": "ab12cd34" },
					},
				),
			),
		);
		const res = await apiFetch("/api/git-status?node=work-win");
		expect(await res.json()).toEqual({
			error: "work-win unreachable: connect ECONNREFUSED",
		});
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 502,
				error: "work-win unreachable: connect ECONNREFUSED (trace=ab12cd34)",
			}),
		);
	});

	it("falls back to the status text when the body has no error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response("<html>oops</html>", {
						status: 500,
						statusText: "Internal Server Error",
					}),
			),
		);
		await apiFetch("/api/items");
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Internal Server Error" }),
		);
	});

	it("holds back a lone 502 behind a blip gate until it repeats", async () => {
		const statuses = [502, 200, 502, 504];
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("{}", { status: statuses.shift() })),
		);
		const blipGate = createProxyBlipGate();
		await apiFetch("/api/git-status?node=mac", { blipGate });
		await apiFetch("/api/git-status?node=mac", { blipGate });
		await apiFetch("/api/git-status?node=mac", { blipGate });
		expect(recordMock).not.toHaveBeenCalled();
		await apiFetch("/api/git-status?node=mac", { blipGate });
		expect(recordMock).toHaveBeenCalledTimes(1);
		expect(recordMock).toHaveBeenCalledWith(
			expect.objectContaining({ status: 504 }),
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
