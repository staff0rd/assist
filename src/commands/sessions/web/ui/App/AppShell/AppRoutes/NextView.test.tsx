// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
	NextIssue,
	NextPickup,
	NextPr,
	NextResponse,
	NextScope,
} from "../../../../next/types";
import type { SessionInfo } from "../../../types";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../../useSessionLaunchContext";
import { NextView } from "./NextView";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function pr(number: number, overrides: Partial<NextPr> = {}): NextPr {
	return {
		repo: "o/r",
		number,
		title: `PR ${number}`,
		author: "alice",
		createdAt: "2026-09-01T00:00:00Z",
		url: `https://github.com/o/r/pull/${number}`,
		requestedAt: "2026-09-01T00:00:00Z",
		reason: "requested",
		checks: "success",
		...overrides,
	};
}

function issue(number: number, repo = "o/r"): NextIssue {
	return {
		repo,
		number,
		title: `Issue ${number}`,
		author: "bob",
		createdAt: "2026-09-01T00:00:00Z",
		url: `https://github.com/${repo}/issues/${number}`,
		labels: ["bug"],
	};
}

function pickup(number: number, repo = "o/other"): NextPickup {
	return {
		...issue(number, repo),
		title: `Pickup ${number}`,
		project: "o/3",
		projectTitle: "Roadmap",
		itemId: `PVTI_${number}`,
		status: "Ready",
		priority: "P1",
		type: { name: "Story", color: "GREEN" },
		boardOrder: [number],
	};
}

const empty = { items: [], error: null };

const defaultScope: NextScope = {
	selfRepo: "o/r",
	peers: [],
	repos: null,
	projects: [],
	pickStatuses: ["Ready", "Todo"],
	excludeLabels: [],
	excludeTypes: [],
};

type Reply = { ok: boolean; json: () => Promise<unknown> };

type Body = Partial<Omit<NextResponse, "scope">> & {
	scope?: Partial<NextScope>;
};

function LocationProbe() {
	const location = useLocation();
	return (
		<>
			<div data-testid="location">{location.search}</div>
			<div data-testid="pathname">{location.pathname}</div>
		</>
	);
}

function renderView(
	body: Body,
	launchAssist = vi.fn(),
	pickupReply: Reply = { ok: true, json: async () => ({ ok: true }) },
	sessions: SessionInfo[] = [],
	selectSession: (id: string) => void = () => {},
) {
	const fetchMock = vi.fn((url: string) =>
		Promise.resolve<Reply>(
			url.startsWith("/api/next/pickup")
				? pickupReply
				: {
						ok: true,
						json: async () => ({
							peerPrs: empty,
							assignedIssues: empty,
							pickups: empty,
							boards: [],
							...body,
							scope: { ...defaultScope, ...body.scope },
						}),
					},
		),
	);
	vi.stubGlobal("fetch", fetchMock);
	const origins: Record<string, string> = {
		"/git/other": "github.com/o/other",
	};
	render(
		<MemoryRouter initialEntries={["/next"]}>
			<RepoSelectionContext.Provider
				value={{
					repos: ["/repo", "/git/other"],
					selectedCwd: "/repo",
					worktreeCwd: "/repo",
					setSelectedCwd: () => {},
					cloneOn: (cwd) => cwd,
					originOf: (cwd) => origins[cwd],
				}}
			>
				<SessionLaunchContext.Provider
					value={{
						launchAssist,
						launchAgentInStream: () => {},
						resumeSession: () => {},
						armUpdateReload: () => {},
					}}
				>
					<NextView sessions={sessions} selectSession={selectSession} />
					<LocationProbe />
				</SessionLaunchContext.Provider>
			</RepoSelectionContext.Provider>
		</MemoryRouter>,
	);
	return launchAssist;
}

async function heroCard() {
	const hero = await screen.findByText("Your next best action");
	return hero.closest(".MuiPaper-root") as HTMLElement;
}

function locationParams() {
	return new URLSearchParams(screen.getByTestId("location").textContent ?? "");
}

describe("NextView ranking", () => {
	it("shows the top PR as the hero with a why line and the rest grouped", async () => {
		renderView({ peerPrs: { items: [pr(1), pr(2)], error: null } });
		const hero = await heroCard();
		expect(within(hero).getByText("PR 1")).toBeTruthy();
		expect(within(hero).getByText("o/r#1")).toBeTruthy();
		expect(
			within(hero).getByText(/the oldest of 2 PRs waiting on your review/),
		).toBeTruthy();
		expect(screen.getByText("PR 2")).toBeTruthy();
		expect(screen.getByText("o/r#2")).toBeTruthy();
		expect(screen.getAllByText("Start session")).toHaveLength(2);
		expect(screen.getAllByText("GitHub")).toHaveLength(2);
	});

	it("ranks peer PRs above assigned issues", async () => {
		renderView({
			peerPrs: { items: [pr(1)], error: null },
			assignedIssues: { items: [issue(5)], error: null },
		});
		const hero = await heroCard();
		expect(within(hero).getByText("PR 1")).toBeTruthy();
		expect(screen.getByText("Issues assigned to you")).toBeTruthy();
		expect(screen.getByText("Issue 5")).toBeTruthy();
	});

	it("recommends the oldest assigned issue when no PRs await review", async () => {
		renderView({
			assignedIssues: { items: [issue(5), issue(6)], error: null },
		});
		const hero = await heroCard();
		expect(within(hero).getByText("Issue 5")).toBeTruthy();
		expect(
			within(hero).getByText(
				/the oldest of 2 issues assigned to you, and no peer PRs await your review/,
			),
		).toBeTruthy();
		expect(screen.getByText("Issue 6")).toBeTruthy();
		expect(screen.queryByText("Peer PRs awaiting your review")).toBeNull();
	});
});

describe("NextView Start session", () => {
	it("launches the chosen review in the selected repo", async () => {
		const launchAssist = renderView({
			peerPrs: { items: [pr(7)], error: null },
		});
		fireEvent.click(await screen.findByText("Start session"));
		fireEvent.click(screen.getByText("Address Comments"));
		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "7"],
			"/repo",
			expect.objectContaining({ title: "PR 7" }),
		);
	});

	it("launches a PR from another repo in that repo's local clone", async () => {
		const launchAssist = renderView({
			peerPrs: { items: [pr(7, { repo: "O/Other" })], error: null },
		});
		fireEvent.click(await screen.findByText("Start session"));
		fireEvent.click(screen.getByText("Address Comments"));
		expect(launchAssist).toHaveBeenCalledWith(
			["review-pr-comments", "7"],
			"/git/other",
			expect.anything(),
		);
	});

	it("disables Start session when the item's repo has no local clone", async () => {
		renderView({
			assignedIssues: { items: [issue(5, "o/elsewhere")], error: null },
		});
		const start = (await screen.findByText("Start session")).closest("button");
		expect(start?.disabled).toBe(true);
		expect(
			screen.getByRole("link", { name: "GitHub" }).getAttribute("href"),
		).toBe("https://github.com/o/elsewhere/issues/5");
	});

	it("opens the new-session dialog prefilled with the issue in its clone", async () => {
		renderView({
			assignedIssues: { items: [issue(5, "o/other")], error: null },
		});
		fireEvent.click(await screen.findByText("Start session"));
		expect(locationParams().get("new")).toBe(
			"Issue o/other#5: Issue 5\nhttps://github.com/o/other/issues/5",
		);
		expect(locationParams().get("newCwd")).toBe("/git/other");
	});
});

describe("NextView session links", () => {
	function reviewSession(
		id: string,
		number: number,
		overrides: Partial<SessionInfo> = {},
	): SessionInfo {
		return {
			id,
			name: id,
			commandType: "assist",
			status: "running",
			startedAt: 0,
			assistArgs: ["review", String(number)],
			remoteOrigin: "github.com/o/r",
			...overrides,
		};
	}

	it("links PR recommendations to the local sessions reviewing them", async () => {
		const selectSession = vi.fn();
		renderView(
			{ peerPrs: { items: [pr(1), pr(2)], error: null } },
			vi.fn(),
			undefined,
			[
				reviewSession("7", 1),
				reviewSession("8", 2),
				reviewSession("9", 2, { node: "peer" }),
			],
			selectSession,
		);
		const hero = await heroCard();
		expect(within(hero).getByText("Start session")).toBeTruthy();
		expect(within(hero).queryByText("Session 8")).toBeNull();
		expect(screen.getByText("Session 8")).toBeTruthy();
		expect(screen.queryByText("Session 9")).toBeNull();
		fireEvent.click(within(hero).getByText("Session 7"));
		expect(selectSession).toHaveBeenCalledWith("7");
		expect(screen.getByTestId("pathname").textContent).toBe("/sessions");
	});
});

describe("NextView sections", () => {
	it("shows a failing source inline while the others still render", async () => {
		renderView({
			peerPrs: { items: [], error: "o/r: gh: not logged in" },
			assignedIssues: { items: [issue(5)], error: null },
		});
		await waitFor(() => expect(screen.getByText("o/r: gh: not logged in")));
		expect(screen.getAllByText("Issue 5").length).toBeGreaterThan(0);
		expect(screen.queryByText(/no peer PRs await your review/)).toBeNull();
		expect(screen.queryByText("Nothing needs you here")).toBeNull();
	});

	it("shows the all-clear state when every source is empty", async () => {
		renderView({});
		expect(await screen.findByText("Nothing needs you here")).toBeTruthy();
	});
});

describe("NextView scope note", () => {
	it("shows defaults with the commands to set each source", async () => {
		renderView({});
		expect(await screen.findByText(/Peers: none/)).toBeTruthy();
		expect(
			screen.getByText(/Repos: o\/r \(this repo, by default\)/),
		).toBeTruthy();
		expect(
			screen.getByText(
				"assist config set next.repos my-org,other/web -g --repo",
			),
		).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "Next settings" }).getAttribute("href"),
		).toBe("/config?search=next");
	});

	it("lists configured peers and repos without setters", async () => {
		renderView({
			scope: {
				peers: ["alice", "bob"],
				repos: ["o/a", "o/b"],
				projects: ["o/3"],
			},
		});
		expect(await screen.findByText(/Peers: alice, bob/)).toBeTruthy();
		expect(screen.getByText(/Repos: o\/a, o\/b/)).toBeTruthy();
		expect(screen.queryByText(/assist config set/)).toBeNull();
	});
});

describe("NextView pickups", () => {
	it("recommends the top pickup only when nothing else is waiting", async () => {
		renderView({ pickups: { items: [pickup(3), pickup(4)], error: null } });
		const hero = await heroCard();
		expect(within(hero).getByText("Pickup 3")).toBeTruthy();
		expect(
			within(hero).getByText(
				/Ready on Roadmap — the top of 2 unassigned project items/,
			),
		).toBeTruthy();
		expect(screen.getByText("Project items to pick up")).toBeTruthy();
		expect(screen.getByText("Pickup 4")).toBeTruthy();
		expect(screen.getAllByText("Roadmap · Ready").length).toBe(2);
		expect(screen.getAllByText("Story").length).toBe(2);
	});

	it("ranks assigned issues above pickups", async () => {
		renderView({
			assignedIssues: { items: [issue(5)], error: null },
			pickups: { items: [pickup(3)], error: null },
		});
		const hero = await heroCard();
		expect(within(hero).getByText("Issue 5")).toBeTruthy();
		expect(within(hero).queryByText("Pickup 3")).toBeNull();
		expect(screen.getByText("Pickup 3")).toBeTruthy();
	});

	it("assigns and moves the item before opening the new-session dialog", async () => {
		renderView({ pickups: { items: [pickup(3)], error: null } });
		fireEvent.click(await screen.findByText("Start session"));
		await waitFor(() =>
			expect(locationParams().get("new")).toBe(
				"Issue o/other#3: Pickup 3\nhttps://github.com/o/other/issues/3",
			),
		);
		expect(locationParams().get("newCwd")).toBe("/git/other");
		const post = vi
			.mocked(fetch)
			.mock.calls.find(([url]) => String(url).startsWith("/api/next/pickup"));
		expect(post?.[0]).toBe("/api/next/pickup?cwd=%2Frepo");
		expect(JSON.parse(String(post?.[1]?.body))).toEqual({
			project: "o/3",
			repo: "o/other",
			number: 3,
			itemId: "PVTI_3",
		});
	});

	it("shows why a pickup failed and does not open the dialog", async () => {
		renderView({ pickups: { items: [pickup(3)], error: null } }, vi.fn(), {
			ok: false,
			json: async () => ({ error: "no project scope" }),
		});
		fireEvent.click(await screen.findByText("Start session"));
		expect(
			await screen.findByText("Could not pick up o/other#3: no project scope"),
		).toBeTruthy();
		expect(locationParams().get("new")).toBeNull();
	});

	it("shows a missing project scope inline in the pickup section", async () => {
		renderView({
			assignedIssues: { items: [issue(5)], error: null },
			pickups: { items: [], error: "The gh token has no project scope" },
		});
		expect(
			await screen.findByText("The gh token has no project scope"),
		).toBeTruthy();
		expect(screen.getAllByText("Issue 5").length).toBeGreaterThan(0);
	});

	it("states the project scope, or the command to set it", async () => {
		renderView({ scope: { projects: ["o/3", "o/5"] } });
		expect(
			await screen.findByText(/Projects: o\/3, o\/5, picking up Ready, Todo/),
		).toBeTruthy();
		cleanup();
		renderView({
			scope: {
				projects: ["o/3"],
				excludeLabels: ["blocked", "spike"],
				excludeTypes: ["Epic"],
			},
		});
		expect(
			await screen.findByText(
				/o\/3, picking up Ready, Todo, excluding labels blocked, spike; types Epic/,
			),
		).toBeTruthy();
		cleanup();
		renderView({});
		expect(
			await screen.findByText(
				"assist config set next.projects my-org/3,my-org/5 -g --repo",
			),
		).toBeTruthy();
	});

	it("links each readable project by its title, leaving unreadable ones as text", async () => {
		renderView({
			scope: { projects: ["o/3", "o/9"] },
			boards: [
				{
					project: "o/3",
					title: "Roadmap",
					url: "https://github.com/orgs/o/projects/3",
				},
			],
		});
		const link = await screen.findByRole("link", { name: "Roadmap" });
		expect(link.getAttribute("href")).toBe(
			"https://github.com/orgs/o/projects/3",
		);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(screen.getByText(/, o\/9, picking up Ready, Todo/)).toBeTruthy();
	});
});
