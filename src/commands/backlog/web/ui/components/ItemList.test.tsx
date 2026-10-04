// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import { makeBacklogItemSummary } from "../../../../../test/mothers/makeBacklogItemSummary";
import type { BacklogItemSummary } from "../types";

vi.mock("../useRepoSummaries", () => ({
	useRepoSummaries: () => ({ summaries: [], node: undefined }),
}));
vi.mock("../../../../sessions/web/ui/LastBackedUp", () => ({
	LastBackedUp: () => null,
}));
vi.mock("./useJiraSite", () => ({ useJiraSite: () => "acme.atlassian.net" }));

import { ItemList } from "./ItemList";

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
				error={null}
				socket={socket}
				onReload={() => Promise.resolve()}
			/>
		</MemoryRouter>,
	);
}

function clickFilter(label: string) {
	const group = screen.getByRole("group", { name: "Type filter" });
	fireEvent.click(within(group).getByRole("button", { name: label }));
}

afterEach(cleanup);

describe("ItemList type filter", () => {
	const items = [
		makeBacklogItemSummary({ id: 1, type: "story", name: "Login flow" }),
		makeBacklogItemSummary({ id: 2, type: "bug", name: "Crash on save" }),
		makeBacklogItemSummary({ id: 3, type: "story", name: "Dashboard chart" }),
	];

	it("shows every item under All", () => {
		renderList(items);

		expect(screen.getByText("Login flow")).toBeTruthy();
		expect(screen.getByText("Crash on save")).toBeTruthy();
		expect(screen.getByText("Dashboard chart")).toBeTruthy();
	});

	it("gives every row its own meta id", () => {
		renderList(items);

		expect(screen.getByText("a1")).toBeTruthy();
		expect(screen.getByText("a2")).toBeTruthy();
		expect(screen.getByText("a3")).toBeTruthy();
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
		renderList([
			makeBacklogItemSummary({ id: 1, type: "story", name: "Login flow" }),
		]);

		clickFilter("Bugs");

		expect(screen.getByText("No bugs in the backlog.")).toBeTruthy();
	});

	it("reflects the story filter when no stories exist", () => {
		renderList([
			makeBacklogItemSummary({ id: 1, type: "bug", name: "Crash on save" }),
		]);

		clickFilter("Stories");

		expect(screen.getByText("No stories in the backlog.")).toBeTruthy();
	});

	it("reports an empty backlog under All", () => {
		renderList([]);

		expect(screen.getByText("No items in the backlog.")).toBeTruthy();
	});
});

describe("ItemList tracker links", () => {
	it("shortens a GitHub issue from the item's own origin", () => {
		renderList([
			makeBacklogItemSummary({
				id: 1,
				type: "story",
				name: "Login flow",
				origin: "github.com/acme/widgets",
				githubIssue: "acme/widgets#123",
			}),
		]);

		const link = screen.getByRole("link", { name: "acme/widgets#123" });
		expect(link.textContent).toBe("#123");
		expect(link.getAttribute("href")).toBe(
			"https://github.com/acme/widgets/issues/123",
		);
	});

	it("shortens an issue from another repo to #N as well", () => {
		renderList([
			makeBacklogItemSummary({
				id: 1,
				type: "story",
				name: "Login flow",
				origin: "github.com/acme/widgets",
				githubIssue: "other/thing#7",
			}),
		]);

		const link = screen.getByRole("link", { name: "other/thing#7" });
		expect(link.textContent).toBe("#7");
		expect(link.getAttribute("href")).toBe(
			"https://github.com/other/thing/issues/7",
		);
	});

	it("links a Jira key", () => {
		renderList([
			makeBacklogItemSummary({
				id: 1,
				type: "story",
				name: "Login flow",
				jiraKey: "BAD-671",
			}),
		]);

		const link = screen.getByRole("link", { name: "BAD-671" });
		expect(link.getAttribute("href")).toBe(
			"https://acme.atlassian.net/browse/BAD-671",
		);
	});

	it("renders no tracker for an item with neither", () => {
		renderList([
			makeBacklogItemSummary({ id: 1, type: "story", name: "Login flow" }),
		]);

		expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
			["Login flow"],
		);
	});
});
