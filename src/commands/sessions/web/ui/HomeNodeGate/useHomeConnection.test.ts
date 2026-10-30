// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiUrl, setApiBase } from "../apiUrl";
import { retryDelayMs } from "./toConnection";
import { useHomeConnection } from "./useHomeConnection";

const fetchMock = vi.fn();

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	fetchMock.mockReset();
	setApiBase("");
});

const healthy = () => Promise.resolve(Response.json({ version: "1.0.0" }));

describe("useHomeConnection", () => {
	it("connects after a successful health probe and points the API at the node", async () => {
		fetchMock.mockImplementation(healthy);
		const { result } = renderHook(() => useHomeConnection("https://mac:3100"));

		await act(() => vi.runAllTimersAsync());

		expect(result.current.connection).toEqual({
			kind: "connected",
			health: { version: "1.0.0" },
		});
		expect(fetchMock).toHaveBeenCalledWith(
			"https://mac:3100/api/health",
			expect.anything(),
		);
		expect(apiUrl("/ws")).toBe("https://mac:3100/ws");
	});

	it("reports unreachable and retries with backoff", async () => {
		fetchMock.mockRejectedValue(new TypeError("Load failed"));
		const { result } = renderHook(() => useHomeConnection("https://mac:3100"));

		await act(() => vi.advanceTimersByTimeAsync(0));
		expect(result.current.connection).toMatchObject({
			kind: "unreachable",
			error: "Load failed",
			attempt: 0,
		});

		fetchMock.mockImplementation(healthy);
		await act(() => vi.advanceTimersByTimeAsync(retryDelayMs(0)));
		expect(result.current.connection.kind).toBe("connected");
	});

	it("caps the backoff at 30 seconds", () => {
		expect(retryDelayMs(0)).toBe(2000);
		expect(retryDelayMs(10)).toBe(30_000);
	});
});
