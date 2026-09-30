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
	NextPr,
	NextResponse,
	NextScope,
} from "../../../../next/types";
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

const empty = { items: [], error: null };

const defaultScope: NextScope = {
	selfRepo: "o/r",
	peers: [],
	repos: null,
};

type Body = Partial<Omit<NextResponse, "scope">> & {
	scope?: Partial<NextScope>;
};

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.search}</div>;
}

function renderView(body: Body, launchAssist = vi.fn()) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				peerPrs: empty,
				assignedIssues: empty,
				...body,
				scope: { ...defaultScope, ...body.scope },
			}),
		}),
	);
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
					<NextView />
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
				"assist config set next.repos owner/api,owner/web -g --repo",
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
			},
		});
		expect(await screen.findByText(/Peers: alice, bob/)).toBeTruthy();
		expect(screen.getByText(/Repos: o\/a, o\/b/)).toBeTruthy();
		expect(screen.queryByText(/assist config set/)).toBeNull();
	});
});
