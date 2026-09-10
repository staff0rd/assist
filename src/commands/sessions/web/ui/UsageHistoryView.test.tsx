// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import type { UsageItemRow } from "./fetchUsageItems";
import { UsageHistoryView } from "./UsageHistoryView";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const peak: UsagePeakRow = {
	window: "five_hour",
	resetsAt: 1_800_000_000,
	segment: 0,
	usedPercentage: 42,
	resetDetected: false,
	tokensUp: 1_000,
	tokensDown: 2_000,
	createdAt: new Date("2026-07-01T00:00:00Z"),
	avgContextPct: 30,
	phaseCount: 4,
};

const item: UsageItemRow = {
	id: 985,
	origin: "github.com/acme/assist",
	type: "story",
	name: "Add a litellm command",
	status: "done",
	phaseCount: 3,
	recordedPhases: 3,
	tokensUp: 6_400_000,
	tokensDown: 118_000,
	activeMs: 4_320_000,
	peakContextPct: 63,
	lastPhaseAt: new Date(Date.now() - 7_200_000).toISOString(),
};

type Page<T> = { rows: T[]; total: number };

function stubApi(pages: {
	peaks?: Record<string, Page<UsagePeakRow>>;
	items?: Page<UsageItemRow>;
}) {
	const fetchMock = vi.fn(async (url: string) => {
		const parsed = new URL(url, "http://localhost");
		const body = parsed.pathname.endsWith("/items")
			? (pages.items ?? { rows: [], total: 0 })
			: ((pages.peaks ?? {})[parsed.searchParams.get("window") ?? "all"] ?? {
					rows: [],
					total: 0,
				});
		return { ok: true, status: 200, json: async () => body };
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function renderView() {
	return render(
		<MemoryRouter initialEntries={["/usage"]}>
			<UsageHistoryView />
		</MemoryRouter>,
	);
}

describe("UsageHistoryView", () => {
	it("keeps the toggle visible and names the window when the filter matches nothing", async () => {
		const fetchMock = stubApi({ peaks: { all: { rows: [peak], total: 1 } } });
		renderView();

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "7d" }));

		await waitFor(() =>
			expect(screen.getByText("No 7d usage peaks recorded yet.")).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "7d" })).toBeTruthy();
		expect(screen.queryByText("Window")).toBeNull();
		expect(fetchMock).toHaveBeenLastCalledWith(
			"/api/usage/history?page=0&pageSize=30&window=seven_day",
		);
	});

	it("returns to the unfiltered rows when All is picked again", async () => {
		stubApi({ peaks: { all: { rows: [peak], total: 1 } } });
		renderView();

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "7d" }));
		await waitFor(() =>
			expect(screen.getByText("No 7d usage peaks recorded yet.")).toBeTruthy(),
		);
		fireEvent.click(screen.getByRole("button", { name: "All" }));

		await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
		expect(screen.queryByText("No 7d usage peaks recorded yet.")).toBeNull();
	});

	it("keeps the generic wording when nothing is recorded at all", async () => {
		stubApi({});
		renderView();

		await waitFor(() =>
			expect(screen.getByText("No usage peaks recorded yet.")).toBeTruthy(),
		);
		expect(screen.queryByText("No 5h usage peaks recorded yet.")).toBeNull();
	});

	describe("the Items tab", () => {
		it("only loads item usage once the tab is opened", async () => {
			const fetchMock = stubApi({
				peaks: { all: { rows: [peak], total: 1 } },
				items: { rows: [item], total: 1 },
			});
			renderView();

			await waitFor(() => expect(screen.getByText("Window")).toBeTruthy());
			expect(
				fetchMock.mock.calls.some(([url]) =>
					url.startsWith("/api/usage/items"),
				),
			).toBe(false);

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(screen.getByText("Add a litellm command")).toBeTruthy(),
			);
			expect(fetchMock).toHaveBeenLastCalledWith(
				"/api/usage/items?page=0&pageSize=30",
			);
		});

		it("shows each item's cost against its repo and phases", async () => {
			stubApi({ items: { rows: [item], total: 1 } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(screen.getByText("a985 · story")).toBeTruthy(),
			);
			expect(screen.getByText("assist")).toBeTruthy();
			expect(screen.getByText("done")).toBeTruthy();
			expect(screen.getByText("1h 12m")).toBeTruthy();
			expect(screen.getByText("24m / phase")).toBeTruthy();
			expect(screen.getByText("↑ 6.4M ↓ 118.0k")).toBeTruthy();
			expect(screen.getByText("2.2M / phase")).toBeTruthy();
			expect(screen.getByText("63%")).toBeTruthy();
			expect(screen.getByText("2h ago")).toBeTruthy();
		});

		it("links each item to its detail page", async () => {
			stubApi({ items: { rows: [item], total: 1 } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(
					screen
						.getByRole("link", { name: "Add a litellm command" })
						.getAttribute("href"),
				).toBe("/backlog/items/a985"),
			);
		});

		it("says so when no item has recorded usage", async () => {
			stubApi({});
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(screen.getByText("No item usage recorded yet.")).toBeTruthy(),
			);
		});
	});
});
