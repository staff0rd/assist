// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import { UsageItemRepoFilter } from "./UsageItemRepoFilter";

afterEach(cleanup);

function openFilter(origins: ItemUsageOriginCount[]) {
	const onChange = vi.fn();
	render(
		<UsageItemRepoFilter origins={origins} origin="all" onChange={onChange} />,
	);
	fireEvent.mouseDown(screen.getByRole("combobox"));
	return onChange;
}

describe("UsageItemRepoFilter", () => {
	it("offers All repos with every repo's item count", () => {
		openFilter([
			{ origin: "github.com/acme/assist", count: 98 },
			{ origin: "github.com/acme/apm", count: 14 },
		]);

		expect(
			screen.getByRole("option", { name: "All repos (112)" }),
		).toBeTruthy();
		expect(screen.getByRole("option", { name: "assist (98)" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "apm (14)" })).toBeTruthy();
	});

	it("falls back to org/repo when two origins share a repo name", () => {
		openFilter([
			{ origin: "github.com/acme/assist", count: 3 },
			{ origin: "github.com/other/assist", count: 1 },
		]);

		expect(
			screen.getByRole("option", { name: "acme/assist (3)" }),
		).toBeTruthy();
		expect(
			screen.getByRole("option", { name: "other/assist (1)" }),
		).toBeTruthy();
	});

	it("reports the picked origin", () => {
		const onChange = openFilter([
			{ origin: "github.com/acme/assist", count: 3 },
		]);

		fireEvent.click(screen.getByRole("option", { name: "assist (3)" }));

		expect(onChange).toHaveBeenCalledWith("github.com/acme/assist");
	});
});
