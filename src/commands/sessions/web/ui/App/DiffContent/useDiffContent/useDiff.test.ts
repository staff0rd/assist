// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearClientFailures } from "../../../clientFailures/recordClientFailure";
import { useDiff } from "./useDiff";

const fetchMock = vi.fn();

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

function diffCalls(): number {
	return fetchMock.mock.calls.filter(([url]) =>
		String(url).includes("/api/diff"),
	).length;
}

describe("useDiff", () => {
	it("waits for a hung poll to settle before polling again", async () => {
		let release: (res: Response) => void = () => {};
		fetchMock.mockImplementation(
			() =>
				new Promise<Response>((resolve) => {
					release = resolve;
				}),
		);
		const { result } = renderHook(() => useDiff("/repo"));
		await act(() => vi.advanceTimersByTimeAsync(25_000));
		result.current.refresh();
		expect(diffCalls()).toBe(1);
		await act(async () => release(new Response("diff body")));
		expect(result.current.diff).toBe("diff body");
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(diffCalls()).toBe(2);
	});

	it("backs off while polls keep failing", async () => {
		fetchMock.mockImplementation(async () => new Response("", { status: 502 }));
		renderHook(() => useDiff("/repo"));
		await act(() => vi.advanceTimersByTimeAsync(0));
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(diffCalls()).toBe(2);
		await act(() => vi.advanceTimersByTimeAsync(9999));
		expect(diffCalls()).toBe(2);
		await act(() => vi.advanceTimersByTimeAsync(1));
		expect(diffCalls()).toBe(3);
	});
});
