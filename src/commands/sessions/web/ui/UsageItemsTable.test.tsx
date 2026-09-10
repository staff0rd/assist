// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultItemUsageSort } from "../../../../shared/db/parseItemUsageSort";
import type { UsageItemRow } from "./fetchUsageItems";
import { UsageItemsTable } from "./UsageItemsTable";

afterEach(cleanup);

const base: UsageItemRow = {
	id: 1,
	origin: "github.com/acme/assist",
	type: "story",
	name: "Item one",
	status: "done",
	phaseCount: 2,
	recordedPhases: 2,
	tokensUp: 1_000_000,
	tokensDown: 20_000,
	activeMs: 600_000,
	peakContextPct: 10,
	lastPhaseAt: "2026-09-01T00:00:00.000Z",
};

function renderTable(
	rows: UsageItemRow[],
	origins = rows.map((row) => row.origin),
	onSort = vi.fn(),
) {
	render(
		<MemoryRouter>
			<UsageItemsTable
				rows={rows}
				origins={origins}
				sort={defaultItemUsageSort}
				onSort={onSort}
			/>
		</MemoryRouter>,
	);
	return onSort;
}

describe("UsageItemsTable", () => {
	it("names the item, its type and its repo on one meta line", () => {
		renderTable([base]);

		expect(screen.getByText("a1 · story · assist")).toBeTruthy();
	});

	it("falls back to org/repo when two origins share a repo name", () => {
		renderTable([
			base,
			{ ...base, id: 2, name: "Item two", origin: "github.com/other/assist" },
		]);

		expect(screen.getByText("a1 · story · acme/assist")).toBeTruthy();
		expect(screen.getByText("a2 · story · other/assist")).toBeTruthy();
	});

	it("keeps the org/repo fallback when the colliding origin is off this page", () => {
		renderTable([base], ["github.com/acme/assist", "github.com/other/assist"]);

		expect(screen.getByText("a1 · story · acme/assist")).toBeTruthy();
	});

	it("counts the recorded phases when the item has no authored plan", () => {
		renderTable([{ ...base, phaseCount: 0, recordedPhases: 5 }]);

		expect(screen.getByText("5")).toBeTruthy();
	});

	it("shows a dash when no phase session was ever recorded", () => {
		renderTable([{ ...base, lastPhaseAt: null }]);

		expect(screen.getByText("—")).toBeTruthy();
	});

	describe("an item that is not done", () => {
		it("reads as running and marks its totals partial", () => {
			renderTable([
				{ ...base, status: "in-progress", phaseCount: 3, recordedPhases: 1 },
			]);

			expect(screen.getByText("running")).toBeTruthy();
			expect(screen.getByText("1 of 3 phases")).toBeTruthy();
		});

		it("keeps a settled status as its own label", () => {
			renderTable([{ ...base, status: "wontdo" }]);

			expect(screen.getByText("wontdo")).toBeTruthy();
			expect(screen.queryByText("running")).toBeNull();
		});

		it("says nothing about phases it cannot place against a plan", () => {
			renderTable([
				{ ...base, status: "in-progress", phaseCount: 0, recordedPhases: 2 },
			]);

			expect(screen.queryByText("2 of 0 phases")).toBeNull();
		});
	});

	describe("a done item", () => {
		it("carries no partial note", () => {
			renderTable([{ ...base, phaseCount: 3, recordedPhases: 1 }]);

			expect(screen.queryByText("1 of 3 phases")).toBeNull();
		});
	});

	describe("the sortable headers", () => {
		const ariaSort = (name: string) =>
			screen.getByRole("columnheader", { name }).getAttribute("aria-sort");

		it("marks the column the rows are sorted by", () => {
			renderTable([base]);

			expect(ariaSort("Last phase")).toBe("descending");
			expect(ariaSort("Tokens")).toBeNull();
		});

		it("reports the field behind a clicked header", () => {
			const onSort = renderTable([base]);

			fireEvent.click(screen.getByText("Tokens"));
			fireEvent.click(screen.getByText("Peak ctx"));

			expect(onSort.mock.calls).toEqual([["tokens"], ["peakContext"]]);
		});

		it("leaves the descriptive columns unsorted", () => {
			const onSort = renderTable([base]);

			fireEvent.click(screen.getByText("Status"));

			expect(onSort).not.toHaveBeenCalled();
			expect(ariaSort("Status")).toBeNull();
		});
	});
});
