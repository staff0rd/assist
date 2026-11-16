// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionInfo } from "../types";
import { PhoneSessionList } from "./PhoneSessionList";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

function session(
	id: string,
	status: SessionInfo["status"],
	extra: Partial<SessionInfo> = {},
): SessionInfo {
	return {
		id,
		name: id,
		title: `Session ${id}`,
		status,
		commandType: "claude",
		startedAt: 0,
		...extra,
	};
}

function renderList(sessions: SessionInfo[]) {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter>
				<PhoneSessionList
					sessions={sessions}
					localNode="mac"
					reconnecting={false}
					onRefresh={() => {}}
				/>
			</MemoryRouter>
		</ThemeProvider>,
	);
}

const rowTitles = () =>
	screen.getAllByTestId("phone-session-row").map((r) => r.textContent ?? "");

describe("PhoneSessionList", () => {
	it("lists Needs you first with Claude's last message", () => {
		renderList([
			session("run", "running"),
			session("ask", "waiting", { lastAssistantMessage: "Proceed?" }),
		]);

		const rows = rowTitles();
		expect(rows[0]).toContain("Session ask");
		expect(rows[0]).toContain("Proceed?");
		expect(rows[1]).toContain("Session run");
		expect(screen.getByText(/Needs you/)).toBeTruthy();
	});

	it("lists question sessions under Answer here above Needs you", () => {
		renderList([
			session("ask", "waiting"),
			session("q", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "Question",
					body: "",
					prNumber: null,
					kind: "question",
				},
			}),
		]);

		const rows = rowTitles();
		expect(rows[0]).toContain("Session q");
		expect(rows[1]).toContain("Session ask");
		expect(screen.getByText(/Answer here/)).toBeTruthy();
	});

	it("hides Answer here when no session has a question", () => {
		renderList([session("ask", "waiting")]);

		expect(screen.queryByText(/Answer here/)).toBeNull();
	});

	it("badges only sessions from linked nodes", () => {
		renderList([
			session("home", "running", { node: "mac" }),
			session("away", "running", { node: "wsl" }),
		]);

		const badges = screen.getAllByTestId("node-badge");
		expect(badges.map((b) => b.textContent)).toEqual(["wsl"]);
	});

	it("collapses Done into a tally that expands", () => {
		renderList([session("d1", "done"), session("d2", "stopped")]);

		expect(screen.queryAllByTestId("phone-session-row")).toHaveLength(0);
		fireEvent.click(screen.getByRole("button", { name: /Done/ }));
		expect(screen.getAllByTestId("phone-session-row")).toHaveLength(2);
	});

	it("collapses review-phase sessions into a Review tally between Running and Done", () => {
		const activity = {
			kind: "backlog" as const,
			itemId: 1,
			startedAt: 0,
			phase: 2,
			totalPhases: 2,
		};
		renderList([
			session("run", "running"),
			session("rev", "running", { activity }),
			session("blocked", "waiting", { activity }),
			session("d1", "done", { activity }),
		]);

		expect(rowTitles()).toEqual([
			expect.stringContaining("Session run"),
			expect.stringContaining("Session rev"),
			expect.stringContaining("Session blocked"),
		]);
		expect(screen.queryByText(/Needs you/)).toBeNull();
		const buttons = screen.getAllByRole("button", { name: /Review|Done/ });
		expect(buttons.map((b) => b.textContent)).toEqual([
			expect.stringMatching(/^◇Review21 needs you/),
			expect.stringMatching(/^✓Done1/),
		]);

		fireEvent.click(buttons[0]);
		expect(rowTitles()).toHaveLength(1);
		fireEvent.click(buttons[0]);
		expect(rowTitles()).toHaveLength(3);
	});

	it("hides the Review tally when no session is in review", () => {
		renderList([session("run", "running")]);

		expect(screen.queryByRole("button", { name: /Review/ })).toBeNull();
	});

	describe("repo chips", () => {
		const assist = { origin: "/git/assist", clone: "/git/assist" };
		const worktree = { origin: "/git/assist", clone: "/git/assist-5" };
		const chipNames = () =>
			screen.getAllByRole("radio").map((c) => c.textContent ?? "");
		const repoSessions = () => [
			session("a-run", "running", { cwd: "/git/assist", repoGroup: assist }),
			session("a-done", "done", { cwd: "/git/assist-5", repoGroup: worktree }),
			session("a-ask", "waiting", {
				cwd: "/git/assist-5",
				repoGroup: worktree,
			}),
			session("o-run", "running", { cwd: "/git/other" }),
			session("o-q", "running", {
				cwd: "/git/other",
				pendingPrPreview: {
					requestId: "r",
					title: "Question",
					body: "",
					prNumber: null,
					kind: "question",
				},
			}),
			session("z-run", "running", { cwd: "/git/zed" }),
		];

		it("lists All then repos by count, grouping clones of one origin", () => {
			renderList(repoSessions());

			expect(chipNames()).toEqual(["All6", "assist3", "other2", "zed1"]);
			expect(
				screen.getByRole("radio", { name: /All/ }).getAttribute("aria-checked"),
			).toBe("true");
		});

		it("marks repos with a session needing you with a dot", () => {
			renderList(repoSessions());

			const dotted = screen
				.getAllByRole("radio")
				.filter((c) => c.querySelector("[aria-label='needs you']"))
				.map((c) => c.textContent);
			expect(dotted).toEqual(["assist3", "other2"]);
		});

		it("filters every group to the selected repo and hides the repo label", () => {
			renderList(repoSessions());
			expect(rowTitles()[0]).toContain("other");

			fireEvent.click(screen.getByRole("radio", { name: /other/ }));
			expect(rowTitles()).toEqual([
				expect.stringContaining("Session o-q"),
				expect.stringContaining("Session o-run"),
			]);
			expect(rowTitles().some((r) => r.includes("other"))).toBe(false);

			fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
			fireEvent.click(screen.getByRole("button", { name: /Done/ }));
			expect(rowTitles()).toEqual([
				expect.stringContaining("Session a-ask"),
				expect.stringContaining("Session a-run"),
				expect.stringContaining("Session a-done"),
			]);

			fireEvent.click(screen.getByRole("radio", { name: /All/ }));
			expect(rowTitles()).toHaveLength(6);
		});

		it("restores the stored repo on mount", () => {
			localStorage.setItem("assist.phone.repoFilter", "/git/zed");
			renderList(repoSessions());

			expect(
				screen.getByRole("radio", { name: /zed/ }).getAttribute("aria-checked"),
			).toBe("true");
			expect(rowTitles()).toEqual([expect.stringContaining("Session z-run")]);
		});

		it("keeps an empty selected repo at 0 with a Show all repos button", () => {
			localStorage.setItem("assist.phone.repoFilter", "/git/gone");
			renderList(repoSessions());

			expect(chipNames()).toContain("gone0");
			expect(screen.getByText("No sessions in gone")).toBeTruthy();
			expect(localStorage.getItem("assist.phone.repoFilter")).toBe("/git/gone");

			fireEvent.click(screen.getByRole("button", { name: "Show all repos" }));
			expect(chipNames()).not.toContain("gone0");
			expect(localStorage.getItem("assist.phone.repoFilter")).toBeNull();
		});
	});
});
