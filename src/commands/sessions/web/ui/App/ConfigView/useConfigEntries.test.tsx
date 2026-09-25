// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { useConfigEntries } from "./useConfigEntries";

afterEach(() => {
	vi.unstubAllGlobals();
});

function entry(key: string, value: unknown): ConfigEntry {
	return { key, type: "string", value, source: "project" };
}

function deferredFetch() {
	const pending: ((entries: ConfigEntry[]) => void)[] = [];
	const fetchMock = vi.fn(
		() =>
			new Promise((resolve) => {
				pending.push((entries) =>
					resolve({ ok: true, status: 200, json: async () => entries }),
				);
			}),
	);
	vi.stubGlobal("fetch", fetchMock);
	return {
		fetchMock,
		settle: async (entries: ConfigEntry[]) => {
			const next = pending.shift();
			if (!next) throw new Error("no request in flight");
			await act(async () => next(entries));
		},
	};
}

describe("useConfigEntries", () => {
	it("keeps the loaded entries while a reload of the same repo is in flight", async () => {
		const { fetchMock, settle } = deferredFetch();
		const { result } = renderHook(() => useConfigEntries("/repo"));

		expect(result.current.loading).toBe(true);
		await settle([entry("backup.dir", "~/one")]);
		expect(result.current.loading).toBe(false);

		act(() => result.current.reload());

		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
		expect(result.current.loading).toBe(false);
		expect(result.current.entries).toEqual([entry("backup.dir", "~/one")]);

		await settle([entry("backup.dir", "~/two")]);
		expect(result.current.entries).toEqual([entry("backup.dir", "~/two")]);
	});

	it("shows the loading state again when the selected repo changes", async () => {
		const { settle } = deferredFetch();
		const { result, rerender } = renderHook(
			({ cwd }) => useConfigEntries(cwd),
			{
				initialProps: { cwd: "/repo/one" },
			},
		);

		await settle([entry("backup.dir", "~/one")]);
		expect(result.current.loading).toBe(false);

		rerender({ cwd: "/repo/two" });

		expect(result.current.loading).toBe(true);
		expect(result.current.entries).toEqual([]);
	});

	it("reports no repo selected without fetching", async () => {
		const { fetchMock } = deferredFetch();
		const { result } = renderHook(() => useConfigEntries(""));

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe("No repo selected.");
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
