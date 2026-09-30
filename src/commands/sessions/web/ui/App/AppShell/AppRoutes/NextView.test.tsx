// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextPr, NextResponse } from "../../../../next/types";
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

function renderView(body: NextResponse, launchAssist = vi.fn()) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ ok: true, json: async () => body }),
	);
	render(
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
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>,
	);
	return launchAssist;
}

describe("NextView", () => {
	it("shows the top PR as the hero with a why line and the rest grouped", async () => {
		renderView({ peerPrs: { items: [pr(1), pr(2)], error: null } });
		const hero = await screen.findByText("Your next best action");
		const heroCard = hero.closest(".MuiPaper-root") as HTMLElement;
		expect(within(heroCard).getByText("PR 1")).toBeTruthy();
		expect(
			within(heroCard).getByText(/the oldest of 2 PRs waiting on your review/),
		).toBeTruthy();
		expect(screen.getByText("PR 2")).toBeTruthy();
		expect(screen.getAllByText("Start session")).toHaveLength(2);
		expect(screen.getAllByText("GitHub")).toHaveLength(2);
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

	it("shows a failing source inline", async () => {
		renderView({ peerPrs: { items: [], error: "gh: not logged in" } });
		await waitFor(() => expect(screen.getByText("gh: not logged in")));
		expect(screen.queryByText("Nothing needs you here")).toBeNull();
	});

	it("shows the all-clear state when every source is empty", async () => {
		renderView({ peerPrs: { items: [], error: null } });
		expect(await screen.findByText("Nothing needs you here")).toBeTruthy();
	});
});
