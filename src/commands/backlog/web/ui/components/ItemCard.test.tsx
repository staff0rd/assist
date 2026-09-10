// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";

vi.mock("./useJiraSite", () => ({ useJiraSite: () => "acme.atlassian.net" }));

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

function renderCard(item: Partial<BacklogItemSummary> = {}) {
	return render(
		<MemoryRouter>
			<ItemCard
				item={{ ...base, ...item }}
				socket={socket}
				onSelect={() => {}}
				onReload={() => Promise.resolve()}
			/>
		</MemoryRouter>,
	);
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
