// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { PhoneAutopilotItems } from "./PhoneAutopilotItems";

afterEach(cleanup);

const item = (over: Partial<AutopilotItemView>): AutopilotItemView => ({
	id: 1871,
	name: "Fresh agent",
	status: "in-progress",
	sessionId: "s1",
	startedAt: "2026-11-23T03:00:00.000Z",
	why: "Hauler fleet stalled.",
	phase: 2,
	totalPhases: 3,
	donePhases: 1,
	remaining: [{ number: 3, name: "Remove AGENT-7" }],
	commits: 1,
	insertions: 58,
	deletions: 4,
	...over,
});

function renderItems(
	items: AutopilotItemView[],
	running: AutopilotStatus["running"] = null,
) {
	const handlers = {
		busy: false,
		onItem: vi.fn(),
		onStop: vi.fn(),
		onOpen: vi.fn(),
		onResume: vi.fn(),
	};
	const status = { prompt: "/helm", running } as AutopilotStatus;
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<PhoneAutopilotItems status={status} items={items} handlers={handlers} />
		</ThemeProvider>,
	);
	return handlers;
}

const button = (name: string) => screen.getByRole("button", { name });

describe("PhoneAutopilotItems", () => {
	it("shows a running item with progress, why and next phases", () => {
		const handlers = renderItems([item({})]);
		expect(screen.getByText("phase 2 of 3")).toBeTruthy();
		expect(screen.getByText("Hauler fleet stalled.")).toBeTruthy();
		expect(screen.getByText("3 Remove AGENT-7")).toBeTruthy();
		fireEvent.click(button("Stop"));
		expect(handlers.onStop).toHaveBeenCalledWith(1871);
		fireEvent.click(button("Open session"));
		expect(handlers.onOpen).toHaveBeenCalledWith("s1");
		fireEvent.click(screen.getByText("Fresh agent"));
		expect(handlers.onItem).toHaveBeenCalledWith(1871);
	});

	it("shows the run while it chooses an item", () => {
		const handlers = renderItems([], {
			sessionId: "run1",
			startedAt: "2026-11-23T03:00:00.000Z",
		} as AutopilotStatus["running"]);
		expect(screen.getByText("choosing an item")).toBeTruthy();
		fireEvent.click(button("Stop"));
		expect(handlers.onStop).toHaveBeenCalledWith();
		expect(screen.getByText("Nothing delivered yet.")).toBeTruthy();
	});

	it("offers Resume only on a stalled delivered item", () => {
		const handlers = renderItems([
			item({ id: 1873, sessionId: null }),
			item({
				id: 1868,
				name: "Market cache",
				status: "done",
				delivered: "Prices cached.",
				result: "measured +1.5k/h",
			}),
		]);
		expect(screen.getByText("No item is running.")).toBeTruthy();
		expect(screen.getByText("Delivered: Prices cached.")).toBeTruthy();
		expect(screen.getByText("measured +1.5k/h")).toBeTruthy();
		expect(screen.getAllByRole("button", { name: "Resume" })).toHaveLength(1);
		fireEvent.click(button("Resume"));
		expect(handlers.onResume).toHaveBeenCalledWith(1873);
	});
});
