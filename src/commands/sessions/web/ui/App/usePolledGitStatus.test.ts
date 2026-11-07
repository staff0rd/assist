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
		respond(() => new Response("<html>oops</html>", { status: 502 }));
		const { result } = await renderPoll();
		expect(result.current.counts).toBeNull();
		const failures = getClientFailures();
		expect(failures).toHaveLength(1);
		expect(failures[0]).toMatchObject({ status: 502 });
		expect(failures[0].kind).not.toBe("caught");
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
});
