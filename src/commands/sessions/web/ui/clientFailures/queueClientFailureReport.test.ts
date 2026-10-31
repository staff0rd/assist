import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientFailure } from "../../../shared/ClientFailure";
import { getClientFailures, recordClientFailure } from "./recordClientFailure";

const failure = (path: string): ClientFailure => ({
	at: "2026-10-31T00:00:00.000Z",
	method: "GET",
	path,
	base: "http://localhost:3100",
	error: "Failed to fetch",
	durationMs: 5,
});

function sentPaths(fetchMock: ReturnType<typeof vi.fn>): string[][] {
	return fetchMock.mock.calls.map(([, init]) =>
		JSON.parse((init as RequestInit).body as string).failures.map(
			(f: ClientFailure) => f.path,
		),
	);
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("queueClientFailureReport", () => {
	it("sends recorded failures in one batch to /api/client-errors", async () => {
		const fetchMock = vi.fn(
			async (_url: string, _init: RequestInit) => new Response("{}"),
		);
		vi.stubGlobal("fetch", fetchMock);
		recordClientFailure(failure("/api/a"));
		recordClientFailure(failure("/api/b"));
		await vi.advanceTimersByTimeAsync(1000);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][0]).toBe("/api/client-errors");
		expect(sentPaths(fetchMock)).toEqual([["/api/a", "/api/b"]]);
	});

	it("buffers undelivered reports and resends them once the server answers", async () => {
		const fetchMock = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("Failed to fetch"))
			.mockResolvedValueOnce(new Response("", { status: 502 }))
			.mockResolvedValue(new Response("{}"));
		vi.stubGlobal("fetch", fetchMock);
		recordClientFailure(failure("/api/a"));
		await vi.advanceTimersByTimeAsync(1000);
		recordClientFailure(failure("/api/b"));
		await vi.advanceTimersByTimeAsync(2000);
		await vi.advanceTimersByTimeAsync(4000);
		await vi.advanceTimersByTimeAsync(60_000);
		expect(sentPaths(fetchMock)).toEqual([
			["/api/a"],
			["/api/a", "/api/b"],
			["/api/a", "/api/b"],
		]);
	});

	it("does not capture failures of its own report requests", async () => {
		const fetchMock = vi.fn(async () => {
			throw new TypeError("Failed to fetch");
		});
		vi.stubGlobal("fetch", fetchMock);
		recordClientFailure(failure("/api/c"));
		const recorded = getClientFailures().length;
		await vi.advanceTimersByTimeAsync(10_000);
		expect(fetchMock).toHaveBeenCalled();
		expect(getClientFailures()).toHaveLength(recorded);
	});
});
