// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";

vi.mock("./useJiraSite", () => ({ useJiraSite: () => "acme.atlassian.net" }));
vi.mock("../api", () => ({ toggleStar: vi.fn(() => Promise.resolve()) }));

import { ItemCard } from "./ItemCard";

const socket = {
	sessions: [],
	selectSession: vi.fn(),
} as unknown as SessionSocket;

const base: BacklogItemSummary = {
	id: 984,
	type: "story",
	name: "Login flow",
	status: "todo",
	starred: false,
	incompleteSubtasks: 0,
};

const itemPath = "/backlog/items/a984";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderCard(item: Partial<BacklogItemSummary> = {}) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<ItemCard
				item={{ ...base, ...item }}
				to={itemPath}
				socket={socket}
				onReload={() => Promise.resolve()}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

function location() {
	return screen.getByTestId("location").textContent;
}

function tabStops(container: HTMLElement) {
	return Array.from(
		container.querySelectorAll<HTMLElement>(
			"a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
		),
	);
}

function stopName(element: HTMLElement) {
	const name =
		element.getAttribute("aria-label") ?? element.textContent?.trim() ?? "";
	return `${element.tagName.toLowerCase()}:${name}`;
}

const longName = `${"A".repeat(64)} ${"B".repeat(65)}`;

afterEach(cleanup);

describe("ItemCard name", () => {
	it("truncates a long name to one line and keeps it as the tooltip", () => {
		renderCard({ name: longName });

		const name = screen.getByText(longName);
		expect(name.getAttribute("title")).toBe(longName);
		const style = getComputedStyle(name);
		expect(style.whiteSpace).toBe("nowrap");
		expect(style.textOverflow).toBe("ellipsis");
		expect(style.overflow).toBe("hidden");
	});
});

describe("ItemCard meta line", () => {
	it("carries the id and the type as a word, not a chip", () => {
		const { container } = renderCard();

		expect(screen.getByText("a984")).toBeTruthy();
		expect(screen.getByText("story")).toBeTruthy();
		expect(container.querySelector(".MuiChip-root")).toBeNull();
	});

	it("shows active time alone, with the full usage as its tooltip", async () => {
		renderCard({
			usageTotal: {
				tokensUp: 12000,
				tokensDown: 3400,
				activeMs: 200_000,
				peakContextPct: 42,
			},
		});

		const activeTime = screen.getByText("⏱ 3m 20s");
		expect(screen.queryByText(/↑/)).toBeNull();

		fireEvent.mouseOver(activeTime);

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toBe("↑ 12.0k ↓ 3.4k · ⏱ 3m 20s · ▓ 42%");
	});

	it("renders no usage when the item has none", () => {
		renderCard();

		expect(screen.queryByText(/⏱/)).toBeNull();
	});
});

describe("ItemCard phase indicator", () => {
	it("shows one meter and no in-progress chip while in progress", () => {
		const { container } = renderCard({
			status: "in-progress",
			currentPhase: 2,
			totalPhases: 3,
		});

		expect(screen.getByTitle("Phase 2 of 3")).toBeTruthy();
		expect(screen.getByText("2/3")).toBeTruthy();
		expect(screen.getByText("phase 2 of 3")).toBeTruthy();
		expect(screen.queryByText("in progress")).toBeNull();
		expect(container.querySelector(".MuiChip-root")).toBeNull();
	});

	it("badges the incomplete subtasks instead of chipping them", () => {
		const { container } = renderCard({ incompleteSubtasks: 2 });

		expect(screen.getByLabelText("2 incomplete subtasks")).toBeTruthy();
		expect(container.querySelector(".MuiChip-root")).toBeNull();
	});
});

describe("ItemCard tracker reference", () => {
	it("shows a cross-repo issue as #n with the full reference as its tooltip", async () => {
		renderCard({
			origin: "github.com/acme/widgets",
			githubIssue: "apm-better-life/apm-better-life#79",
		});

		const link = screen.getByRole("link", {
			name: "apm-better-life/apm-better-life#79",
		});
		expect(link.textContent).toBe("#79");
		expect(link.querySelector("svg")).toBeTruthy();
		expect(link.getAttribute("href")).toBe(
			"https://github.com/apm-better-life/apm-better-life/issues/79",
		);

		fireEvent.mouseOver(link);

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toBe("apm-better-life/apm-better-life#79");
	});

	it("shows an own-repo issue as #n too", () => {
		renderCard({
			origin: "github.com/acme/widgets",
			githubIssue: "acme/widgets#123",
		});

		expect(
			screen.getByRole("link", { name: "acme/widgets#123" }).textContent,
		).toBe("#123");
	});
});

describe("ItemCard row link", () => {
	it("stretches a real link to the item over the row", () => {
		renderCard();

		const link = screen.getByRole("link", { name: base.name });
		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe(itemPath);

		fireEvent.click(link);

		expect(location()).toBe(itemPath);
	});

	it("puts the row link and each action in the tab order", () => {
		const { container } = renderCard();

		const stops = tabStops(container);

		expect(stops.map(stopName)).toEqual([
			`a:${base.name}`,
			"button:Star",
			"button:Build",
		]);
		for (const stop of stops) {
			stop.focus();
			expect(document.activeElement).toBe(stop);
		}
	});

	it("keeps the actions above the stretched link", () => {
		const { container } = renderCard();

		const actions = screen
			.getByRole("button", { name: "Star" })
			.closest("div") as HTMLElement;
		expect(container.contains(actions)).toBe(true);
		expect(getComputedStyle(actions).zIndex).toBe("2");
	});

	it("does not open the item when Star is activated", () => {
		renderCard();

		fireEvent.click(screen.getByRole("button", { name: "Star" }));

		expect(location()).toBe("/backlog");
	});

	it("does not open the item when Build is activated", () => {
		renderCard();

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(location()).toBe("/backlog");
	});
});
