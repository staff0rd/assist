// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AutopilotTick } from "../../../../daemon/autopilot/AutopilotRecord";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { PhoneRunsSection } from "./PhoneRunsSection";

afterEach(cleanup);

const tick = (minute: number, over: Partial<AutopilotTick> = {}) =>
	({
		at: `2026-11-23T03:${String(minute).padStart(2, "0")}:00.000Z`,
		outcome: "launched",
		...over,
	}) as AutopilotTick;

function renderRuns(runs: AutopilotTick[]) {
	render(
		<ThemeProvider theme={createDesignTheme("light", "touch")}>
			<PhoneRunsSection runs={runs} />
		</ThemeProvider>,
	);
}

describe("PhoneRunsSection", () => {
	it("collapses a run to its items and expands its summary on tap", () => {
		renderRuns([
			tick(30, {
				items: [1871],
				summary: {
					checked: "Credits flat.",
					decided: "Replace agent.",
					started: "a1871",
					next: "Re-check.",
				},
			}),
		]);
		expect(screen.getByText("started a1871")).toBeTruthy();
		expect(screen.queryByText("Credits flat.")).toBeNull();
		fireEvent.click(screen.getByText("started a1871"));
		expect(screen.getByText("Checked")).toBeTruthy();
		expect(screen.getByText("Credits flat.")).toBeTruthy();
		expect(screen.getByText("Re-check.")).toBeTruthy();
	});

	it("notes a run with no summary recorded", () => {
		renderRuns([tick(30)]);
		fireEvent.click(screen.getByText("started no item · no summary recorded"));
		expect(screen.getByText("The run recorded no summary.")).toBeTruthy();
	});

	it("shows the latest 5 runs, then all on Show all", () => {
		renderRuns(Array.from({ length: 7 }, (_, i) => tick(i)));
		expect(screen.getAllByTestId("phone-autopilot-run")).toHaveLength(5);
		fireEvent.click(screen.getByRole("button", { name: "Show all 7 runs" }));
		expect(screen.getAllByTestId("phone-autopilot-run")).toHaveLength(7);
		expect(
			screen.getByRole("button", { name: "Show the latest 5" }),
		).toBeTruthy();
	});

	it("says when no run has finished", () => {
		renderRuns([]);
		expect(screen.getByText("No run has finished yet.")).toBeTruthy();
	});
});
