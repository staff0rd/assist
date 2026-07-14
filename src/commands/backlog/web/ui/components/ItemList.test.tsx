// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";

vi.mock("../useRepoSummaries", () => ({ useRepoSummaries: () => [] }));
vi.mock("../../../../sessions/web/ui/LastBackedUp", () => ({
	LastBackedUp: () => null,
}));

import { ItemList } from "./ItemList";

function item(
	id: number,
	type: "story" | "bug",
	name: string,
): BacklogItemSummary {
	return {
		id,
		type,
		name,
		status: "todo",
		starred: false,
		incompleteSubtasks: 0,
	};
}

const socket = {
	sessions: [],
	selectSession: vi.fn(),
} as unknown as SessionSocket;

function renderList(items: BacklogItemSummary[]) {
	return render(
		<MemoryRouter>
			<ItemList
				items={items}
				loading={false}
				socket={socket}
				onReload={() => Promise.resolve()}
			/>
		</MemoryRouter>,
	);
}

function clickFilter(label: string) {
	fireEvent.click(screen.getByRole("button", { name: label }));
}

afterEach(cleanup);

describe("ItemList type filter", () => {
	const items = [
		item(1, "story", "Login flow"),
		item(2, "bug", "Crash on save"),
		item(3, "story", "Dashboard chart"),
	];

	it("shows every item under All", () => {
		renderList(items);

		expect(screen.getByText("Login flow")).toBeTruthy();
		expect(screen.getByText("Crash on save")).toBeTruthy();
		expect(screen.getByText("Dashboard chart")).toBeTruthy();
	});

	it("narrows to stories when Stories is selected", () => {
		renderList(items);

		clickFilter("Stories");

		expect(screen.getByText("Login flow")).toBeTruthy();
		expect(screen.getByText("Dashboard chart")).toBeTruthy();
		expect(screen.queryByText("Crash on save")).toBeNull();
	});

	it("narrows to bugs when Bugs is selected", () => {
		renderList(items);

		clickFilter("Bugs");

		expect(screen.getByText("Crash on save")).toBeTruthy();
		expect(screen.queryByText("Login flow")).toBeNull();
		expect(screen.queryByText("Dashboard chart")).toBeNull();
	});

	it("defaults back to All when All is re-selected", () => {
		renderList(items);

		clickFilter("Bugs");
		clickFilter("All");

		expect(screen.getByText("Login flow")).toBeTruthy();
		expect(screen.getByText("Crash on save")).toBeTruthy();
	});
});

describe("ItemList empty state", () => {
	it("reflects the bug filter when no bugs exist", () => {
		renderList([item(1, "story", "Login flow")]);

		clickFilter("Bugs");

		expect(screen.getByText("No bugs in the backlog.")).toBeTruthy();
	});

	it("reflects the story filter when no stories exist", () => {
		renderList([item(1, "bug", "Crash on save")]);

		clickFilter("Stories");

		expect(screen.getByText("No stories in the backlog.")).toBeTruthy();
	});

	it("reports an empty backlog under All", () => {
		renderList([]);

		expect(screen.getByText("No items in the backlog.")).toBeTruthy();
	});
});
