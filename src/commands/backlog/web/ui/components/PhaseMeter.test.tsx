// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BacklogItemSummary } from "../types";
import { PhaseMeter } from "./PhaseMeter";

const base: BacklogItemSummary = {
	id: 984,
	type: "story",
	name: "Login flow",
	status: "todo",
	starred: false,
	incompleteSubtasks: 0,
	totalPhases: 4,
};

function renderMeter(item: Partial<BacklogItemSummary>) {
	const { container } = render(<PhaseMeter item={{ ...base, ...item }} />);
	return container;
}

function segments(container: HTMLElement) {
	return [...container.querySelectorAll("[data-segment]")].map((segment) =>
		segment.getAttribute("data-segment"),
	);
}

afterEach(cleanup);

describe("PhaseMeter", () => {
	it("marks the phases before the current one done and the rest remaining", () => {
		const container = renderMeter({ status: "in-progress", currentPhase: 3 });

		expect(segments(container)).toEqual([
			"done",
			"done",
			"current",
			"remaining",
		]);
	});

	it("labels the current phase out of the total", () => {
		renderMeter({ status: "in-progress", currentPhase: 3 });

		expect(screen.getByText("3/4")).toBeTruthy();
		expect(screen.getByTitle("Phase 3 of 4")).toBeTruthy();
	});

	it("marks every segment complete for a done item", () => {
		const container = renderMeter({ status: "done", currentPhase: 2 });

		expect(segments(container)).toEqual([
			"complete",
			"complete",
			"complete",
			"complete",
		]);
		expect(screen.getByText("4/4")).toBeTruthy();
	});

	it("renders nothing for a rewound todo item that still has a current phase", () => {
		const container = renderMeter({ status: "todo", currentPhase: 2 });

		expect(container.firstChild).toBeNull();
	});

	it("renders nothing for an in-progress item with no current phase", () => {
		const container = renderMeter({ status: "in-progress" });

		expect(container.firstChild).toBeNull();
	});

	it("renders nothing when the item has no phases", () => {
		const container = renderMeter({
			status: "in-progress",
			currentPhase: 1,
			totalPhases: undefined,
		});

		expect(container.firstChild).toBeNull();
	});
});
