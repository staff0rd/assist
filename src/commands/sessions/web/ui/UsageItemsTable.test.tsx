// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
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

function renderTable(rows: UsageItemRow[]) {
	return render(
		<MemoryRouter>
			<UsageItemsTable rows={rows} />
		</MemoryRouter>,
	);
}

describe("UsageItemsTable", () => {
	it("shortens a repo label to its bare name", () => {
		renderTable([base]);

		expect(screen.getByText("assist")).toBeTruthy();
	});

	it("falls back to org/repo when two origins share a repo name", () => {
		renderTable([
			base,
			{ ...base, id: 2, name: "Item two", origin: "github.com/other/assist" },
		]);

		expect(screen.getByText("acme/assist")).toBeTruthy();
		expect(screen.getByText("other/assist")).toBeTruthy();
	});

	it("counts the recorded phases when the item has no authored plan", () => {
		renderTable([{ ...base, phaseCount: 0, recordedPhases: 5 }]);

		expect(screen.getByText("5")).toBeTruthy();
	});

	it("shows a dash when no phase session was ever recorded", () => {
		renderTable([{ ...base, lastPhaseAt: null }]);

		expect(screen.getByText("—")).toBeTruthy();
	});
});
