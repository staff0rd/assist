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
import type { NextIssue, NextPr, NextResponse } from "../../../../next/types";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../../useSessionLaunchContext";
import { NextView } from "./NextView";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function pr(number: number, overrides: Partial<NextPr> = {}): NextPr {
	return {
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

function issue(number: number): NextIssue {
	return {
		number,
		title: `Issue ${number}`,
		author: "bob",
		createdAt: "2026-09-01T00:00:00Z",
		url: `https://github.com/o/r/issues/${number}`,
		labels: ["bug"],
	};
}

const empty = { items: [], error: null };

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.search}</div>;
}

function renderView(body: Partial<NextResponse>, launchAssist = vi.fn()) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				peers: [],
				peerPrs: empty,
				assignedIssues: empty,
				...body,
			}),
		}),
	);
	render(
		<MemoryRouter initialEntries={["/next"]}>
			<RepoSelectionContext.Provider
				value={{
					repos: [],
					selectedCwd: "/repo",
					worktreeCwd: "/repo",
					setSelectedCwd: () => {},
					cloneOn: (cwd) => cwd,
					originOf: () => undefined,
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

describe("NextView", () => {
	it("shows the top PR as the hero with a why line and the rest grouped", async () => {
		renderView({ peerPrs: { items: [pr(1), pr(2)], error: null } });
		const hero = await heroCard();
		expect(within(hero).getByText("PR 1")).toBeTruthy();
		expect(
			within(hero).getByText(/the oldest of 2 PRs waiting on your review/),
		).toBeTruthy();
		expect(screen.getByText("PR 2")).toBeTruthy();
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

	it("launches the chosen review from the review type dialog", async () => {
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

	it("opens the new-session dialog prefilled with the issue", async () => {
		renderView({ assignedIssues: { items: [issue(5)], error: null } });
		fireEvent.click(await screen.findByText("Start session"));
		const params = new URLSearchParams(
			screen.getByTestId("location").textContent ?? "",
		);
		expect(params.get("new")).toBe(
			"Issue #5: Issue 5\nhttps://github.com/o/r/issues/5",
		);
	});

	it("shows a failing source inline while the others still render", async () => {
		renderView({
			peerPrs: { items: [], error: "gh: not logged in" },
			assignedIssues: { items: [issue(5)], error: null },
		});
		await waitFor(() => expect(screen.getByText("gh: not logged in")));
		expect(screen.getAllByText("Issue 5").length).toBeGreaterThan(0);
		expect(screen.queryByText(/no peer PRs await your review/)).toBeNull();
		expect(screen.queryByText("Nothing needs you here")).toBeNull();
	});

	it("tells you how to configure peers when none are set", async () => {
		renderView({});
		expect(await screen.findByText(/No peers configured/)).toBeTruthy();
		expect(
			screen.getByText("assist config set next.peers alice,bob -g --repo"),
		).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "Next settings" }).getAttribute("href"),
		).toBe("/config?search=next");
	});

	it("names the configured peers", async () => {
		renderView({ peers: ["alice", "bob"] });
		expect(await screen.findByText(/Peer PRs from alice, bob/)).toBeTruthy();
	});

	it("shows the all-clear state when every source is empty", async () => {
		renderView({});
		expect(await screen.findByText("Nothing needs you here")).toBeTruthy();
	});
});
