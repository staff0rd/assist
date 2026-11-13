// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearClientFailures,
	getClientFailures,
} from "../clientFailures/recordClientFailure";
import { usePolledGitStatus } from "./usePolledGitStatus";

const fetchMock = vi.fn();
const counts = { modified: 1 };

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	fetchMock.mockReset();
	clearClientFailures();
});

function gitStatusCalls(): unknown[][] {
	return fetchMock.mock.calls.filter(([url]) =>
		String(url).includes("/api/git-status"),
	);
}

function respond(...responses: (() => Response)[]): void {
	fetchMock.mockImplementation(async (url: string) => {
		if (!url.includes("/api/git-status")) return new Response("{}");
		const index = Math.min(gitStatusCalls().length, responses.length) - 1;
		return responses[index]();
	});
}

function gateway(status: number): Response {
	return Response.json(
		{ error: "work-win unreachable: connect ECONNREFUSED" },
		{ status, statusText: "Bad Gateway" },
	);
}

async function renderPoll() {
	const hook = renderHook(() => usePolledGitStatus("/repo"));
	await act(() => vi.advanceTimersByTimeAsync(0));
	return hook;
}

describe("usePolledGitStatus", () => {
	it("sets the counts from a JSON response", async () => {
		respond(() => Response.json(counts));
		const { result } = await renderPoll();
		expect(result.current.counts).toEqual(counts);
		expect(getClientFailures()).toEqual([]);
	});

	it("records a non-OK response once, without a parse failure", async () => {
		respond(() => new Response("<html>oops</html>", { status: 500 }));
		const { result } = await renderPoll();
		expect(result.current.counts).toBeNull();
		const failures = getClientFailures();
		expect(failures).toHaveLength(1);
		expect(failures[0]).toMatchObject({ status: 500 });
		expect(failures[0].kind).not.toBe("caught");
	});

	it("records no failure for a single 502 followed by a successful poll", async () => {
		respond(
			() => gateway(502),
			() => Response.json(counts),
		);
		const { result } = await renderPoll();
		expect(result.current.counts).toBeNull();
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(result.current.counts).toEqual(counts);
		expect(getClientFailures()).toEqual([]);
	});

	it("records a 504 that persists, with the server's error message", async () => {
		respond(() => gateway(504));
		await renderPoll();
		expect(getClientFailures()).toEqual([]);
		await act(() => vi.advanceTimersByTimeAsync(5000));
		const failures = getClientFailures();
		expect(failures).toHaveLength(1);
		expect(failures[0]).toMatchObject({
			status: 504,
			error: "work-win unreachable: connect ECONNREFUSED",
		});
	});

	it("skips a 200 response whose body is not JSON and keeps polling", async () => {
		respond(
			() => Response.json(counts),
			() => new Response("", { status: 200 }),
			() => Response.json({ modified: 2 }),
		);
		const { result } = await renderPoll();
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(result.current.counts).toEqual(counts);
		expect(getClientFailures()).toEqual([]);
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(result.current.counts).toEqual({ modified: 2 });
		expect(getClientFailures()).toEqual([]);
	});

	it("waits for a hung poll to settle before polling again", async () => {
		let release: (res: Response) => void = () => {};
		fetchMock.mockImplementation(
			(url: string) =>
				new Promise<Response>((resolve) => {
					if (!url.includes("/api/git-status")) resolve(new Response("{}"));
					else release = resolve;
				}),
		);
		const { result } = await renderPoll();
		await act(() => vi.advanceTimersByTimeAsync(25_000));
		result.current.refresh();
		expect(gitStatusCalls()).toHaveLength(1);
		await act(async () => release(Response.json(counts)));
		expect(result.current.counts).toEqual(counts);
		expect(gitStatusCalls()).toHaveLength(1);
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(gitStatusCalls()).toHaveLength(2);
	});

	it("backs off while polls keep failing and resets after a success", async () => {
		let failing = true;
		fetchMock.mockImplementation(async (url: string) =>
			!url.includes("/api/git-status") || !failing
				? Response.json(counts)
				: gateway(502),
		);
		await renderPoll();
		const after = async (ms: number) => {
			await act(() => vi.advanceTimersByTimeAsync(ms));
			return gitStatusCalls().length;
		};
		expect(await after(5000)).toBe(2);
		expect(await after(9999)).toBe(2);
		expect(await after(1)).toBe(3);
		expect(await after(20_000)).toBe(4);
		expect(await after(40_000)).toBe(5);
		expect(await after(60_000)).toBe(6);
		expect(await after(60_000)).toBe(7);
		failing = false;
		expect(await after(60_000)).toBe(8);
		expect(await after(5000)).toBe(9);
	});
});
