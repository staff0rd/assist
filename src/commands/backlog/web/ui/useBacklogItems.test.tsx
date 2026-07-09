// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { backlogItemsCache } from "./backlogItemsCache";
import type { BacklogItemSummary } from "./types";

const loadBacklogItems = vi.fn();
let cwd: string | undefined;
let showCompleted: boolean;

vi.mock("./loadBacklogItems", () => ({
	loadBacklogItems: (...args: unknown[]) => loadBacklogItems(...args),
}));
vi.mock("./useRepoCwd", () => ({ useRepoCwd: () => cwd }));
vi.mock("./useShowCompleted", () => ({
	useShowCompleted: () => [showCompleted, vi.fn()] as const,
}));

import { useBacklogItems } from "./useBacklogItems";

function item(
	id: number,
	overrides: Partial<BacklogItemSummary> = {},
): BacklogItemSummary {
	return {
		id,
		type: "story",
		name: `item ${id}`,
		status: "todo",
		starred: false,
		incompleteSubtasks: 0,
		...overrides,
	};
}

function resolveLoad(items: BacklogItemSummary[], found = true) {
	loadBacklogItems.mockResolvedValue({ found, items });
}

beforeEach(() => {
	cwd = "/repo";
	showCompleted = false;
	loadBacklogItems.mockReset();
});

afterEach(() => {
	vi.clearAllMocks();
});

describe("useBacklogItems", () => {
	it("shows the spinner on a true first load (cache miss)", async () => {
		// No cache entry for this cwd yet.
		cwd = "/fresh";
		resolveLoad([item(1)]);

		const { result } = renderHook(() => useBacklogItems());

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.items).toEqual([item(1)]);
	});

	it("renders cached items immediately with no spinner, then revalidates silently", async () => {
		backlogItemsCache.set("/repo", false, [item(1)]);
		resolveLoad([item(1), item(2)]);

		const { result } = renderHook(() => useBacklogItems());

		// Cache hit: items present and no spinner from the very first render.
		expect(result.current.loading).toBe(false);
		expect(result.current.items).toEqual([item(1)]);

		// Background revalidation updates the list without ever flipping loading.
		await waitFor(() =>
			expect(result.current.items).toEqual([item(1), item(2)]),
		);
		expect(result.current.loading).toBe(false);
	});

	it("keeps the same items reference when revalidation finds no change", async () => {
		backlogItemsCache.set("/repo", false, [item(1)]);
		resolveLoad([item(1)]);

		const { result } = renderHook(() => useBacklogItems());
		const before = result.current.items;

		await waitFor(() => expect(loadBacklogItems).toHaveBeenCalled());
		// Give the revalidation microtask a chance to commit.
		await act(async () => {});

		expect(result.current.items).toBe(before);
	});

	it("shows the spinner when switching to an uncached cwd", async () => {
		backlogItemsCache.set("/repo", false, [item(1)]);
		resolveLoad([item(1)]);

		const { result, rerender } = renderHook(() => useBacklogItems());
		await waitFor(() => expect(result.current.loading).toBe(false));

		cwd = "/uncached";
		resolveLoad([item(9)]);
		rerender();

		expect(result.current.loading).toBe(true);
		expect(result.current.items).toEqual([]);
		await waitFor(() => expect(result.current.items).toEqual([item(9)]));
		expect(result.current.loading).toBe(false);
	});

	it("picks up a cross-machine status change via background polling without remount", async () => {
		vi.useFakeTimers();
		try {
			backlogItemsCache.set("/repo", false, [item(1)]);
			resolveLoad([item(1)]);

			const { result } = renderHook(() => useBacklogItems());
			await act(async () => {
				await vi.advanceTimersByTimeAsync(0);
			});
			expect(result.current.items).toEqual([item(1)]);

			resolveLoad([item(1, { status: "in-progress" })]);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(5000);
			});

			expect(result.current.items).toEqual([
				item(1, { status: "in-progress" }),
			]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("re-seeds from the matching cache entry when showCompleted toggles", async () => {
		backlogItemsCache.set("/repo", false, [item(1)]);
		backlogItemsCache.set("/repo", true, [
			item(1),
			item(2, { status: "done" }),
		]);
		resolveLoad([item(1)]);

		const { result, rerender } = renderHook(() => useBacklogItems());
		expect(result.current.items).toEqual([item(1)]);

		// Toggle on: must show the completed-key cache, not the stale active set.
		showCompleted = true;
		resolveLoad([item(1), item(2, { status: "done" })]);
		rerender();

		expect(result.current.loading).toBe(false);
		expect(result.current.items).toEqual([
			item(1),
			item(2, { status: "done" }),
		]);
	});
});
