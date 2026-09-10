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
import type { UsageItemRow, UsageItemsPage } from "./fetchUsageItems";
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

const noItems: UsageItemsPage = {
	rows: [],
	total: 0,
	summary: {
		itemCount: 0,
		doneCount: 0,
		repoCount: 0,
		medianPhases: 0,
		medianActiveMs: 0,
		medianTokens: 0,
	},
	origins: [],
};

const itemsPage: UsageItemsPage = {
	rows: [item],
	total: 3,
	summary: {
		itemCount: 3,
		doneCount: 2,
		repoCount: 2,
		medianPhases: 3,
		medianActiveMs: 2_700_000,
		medianTokens: 3_000_000,
	},
	origins: [
		{ origin: "github.com/acme/assist", count: 2 },
		{ origin: "github.com/acme/apm", count: 1 },
	],
};

function stubApi(pages: {
	peaks?: Record<string, Page<UsagePeakRow>>;
	items?: Record<string, UsageItemsPage>;
	statuses?: Record<string, UsageItemsPage>;
}) {
	const itemsBody = (params: URLSearchParams) => {
		const status = params.get("status");
		if (status) return (pages.statuses ?? {})[status] ?? noItems;
		return (pages.items ?? {})[params.get("origin") ?? "all"] ?? noItems;
	};
	const fetchMock = vi.fn(async (url: string) => {
		const parsed = new URL(url, "http://localhost");
		const body = parsed.pathname.endsWith("/items")
			? itemsBody(parsed.searchParams)
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
				items: { all: itemsPage },
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
			stubApi({ items: { all: itemsPage } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(screen.getByText("a985 · story · assist")).toBeTruthy(),
			);
			expect(screen.getByText("done")).toBeTruthy();
			expect(screen.getByText("1h 12m")).toBeTruthy();
			expect(screen.getByText("24m / phase")).toBeTruthy();
			expect(screen.getByText("↑ 6.4M ↓ 118.0k")).toBeTruthy();
			expect(screen.getByText("2.2M / phase")).toBeTruthy();
			expect(screen.getByText("63%")).toBeTruthy();
			expect(screen.getByText("2h ago")).toBeTruthy();
		});

		it("links each item to its detail page", async () => {
			stubApi({ items: { all: itemsPage } });
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

		it("summarises the filtered set above the table", async () => {
			stubApi({ items: { all: itemsPage } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() =>
				expect(screen.getByText("Items with recorded usage")).toBeTruthy(),
			);
			expect(screen.getByText("across 2 repos · 2 done")).toBeTruthy();
			expect(screen.getByText("45m")).toBeTruthy();
			expect(screen.getByText("15m per phase")).toBeTruthy();
			expect(screen.getByText("3.0M")).toBeTruthy();
			expect(screen.getByText("1.0M per phase")).toBeTruthy();
		});

		it("refetches the rows and the summary for the picked repo", async () => {
			const apm: UsageItemsPage = {
				...itemsPage,
				rows: [],
				total: 1,
				summary: {
					...itemsPage.summary,
					itemCount: 1,
					doneCount: 1,
					repoCount: 1,
				},
			};
			const fetchMock = stubApi({
				items: { all: itemsPage, "github.com/acme/apm": apm },
			});
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("Median phases")).toBeTruthy(),
			);
			fireEvent.mouseDown(screen.getByRole("combobox", { name: "Repo" }));
			fireEvent.click(screen.getByRole("option", { name: "apm (1)" }));

			await waitFor(() =>
				expect(screen.getByText("across 1 repo · 1 done")).toBeTruthy(),
			);
			expect(fetchMock).toHaveBeenLastCalledWith(
				"/api/usage/items?page=0&pageSize=30&origin=github.com%2Facme%2Fapm",
			);
		});

		it("marks a running item's totals partial", async () => {
			const running: UsageItemRow = {
				...item,
				id: 987,
				name: "Usage history: analyse implemented items",
				status: "in-progress",
				phaseCount: 3,
				recordedPhases: 1,
			};
			stubApi({ items: { all: { ...itemsPage, rows: [running] } } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));

			await waitFor(() => expect(screen.getByText("running")).toBeTruthy());
			expect(screen.getByText("1 of 3 phases")).toBeTruthy();
		});

		it("narrows the rows and the summary to the picked status", async () => {
			const runningOnly: UsageItemsPage = {
				...itemsPage,
				total: 1,
				summary: {
					...itemsPage.summary,
					itemCount: 1,
					doneCount: 0,
					repoCount: 1,
				},
			};
			const fetchMock = stubApi({
				items: { all: itemsPage },
				statuses: { running: runningOnly },
			});
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("across 2 repos · 2 done")).toBeTruthy(),
			);
			fireEvent.click(screen.getByRole("button", { name: "Running" }));

			await waitFor(() =>
				expect(screen.getByText("across 1 repo · 0 done")).toBeTruthy(),
			);
			expect(fetchMock).toHaveBeenLastCalledWith(
				"/api/usage/items?page=0&pageSize=30&status=running",
			);
		});

		it("says when a filter matches nothing without hiding the filters", async () => {
			const none: UsageItemsPage = {
				...itemsPage,
				rows: [],
				total: 0,
				summary: { ...itemsPage.summary, itemCount: 0, doneCount: 0 },
			};
			stubApi({ items: { all: itemsPage }, statuses: { done: none } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("Median phases")).toBeTruthy(),
			);
			fireEvent.click(screen.getByRole("button", { name: "Done" }));

			await waitFor(() =>
				expect(screen.getByText("No items match this filter.")).toBeTruthy(),
			);
			expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
			expect(screen.getByRole("combobox", { name: "Repo" })).toBeTruthy();
		});

		it("sorts by a clicked column and flips it on a second click", async () => {
			const fetchMock = stubApi({ items: { all: itemsPage } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("Median phases")).toBeTruthy(),
			);
			fireEvent.click(screen.getByText("Active"));

			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=0&pageSize=30&sort=active",
				),
			);
			fireEvent.click(screen.getByText("Active"));

			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=0&pageSize=30&sort=active&direction=asc",
				),
			);
		});

		it("returns to the first page when the sort changes", async () => {
			const paged: UsageItemsPage = { ...itemsPage, total: 60 };
			const fetchMock = stubApi({ items: { all: paged } });
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("Median phases")).toBeTruthy(),
			);
			fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=1&pageSize=30",
				),
			);
			fireEvent.click(screen.getByText("Phases"));

			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=0&pageSize=30&sort=phases",
				),
			);
		});

		it("returns to the first page when the repo changes", async () => {
			const paged: UsageItemsPage = { ...itemsPage, total: 60 };
			const fetchMock = stubApi({
				items: { all: paged, "github.com/acme/apm": paged },
			});
			renderView();

			fireEvent.click(await screen.findByRole("tab", { name: "Items" }));
			await waitFor(() =>
				expect(screen.getByText("Median phases")).toBeTruthy(),
			);
			fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=1&pageSize=30",
				),
			);
			fireEvent.mouseDown(screen.getByRole("combobox", { name: "Repo" }));
			fireEvent.click(screen.getByRole("option", { name: "apm (1)" }));

			await waitFor(() =>
				expect(fetchMock).toHaveBeenLastCalledWith(
					"/api/usage/items?page=0&pageSize=30&origin=github.com%2Facme%2Fapm",
				),
			);
		});
	});
});
