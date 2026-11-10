// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionInfo } from "../types";
import { PhoneSessionList } from "./PhoneSessionList";

afterEach(cleanup);

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

		expect(rowTitles()).toEqual([expect.stringContaining("Session run")]);
		expect(screen.queryByText(/Needs you/)).toBeNull();
		const buttons = screen.getAllByRole("button", { name: /Review|Done/ });
		expect(buttons.map((b) => b.textContent)).toEqual([
			expect.stringMatching(/^◇Review21 needs you/),
			expect.stringMatching(/^✓Done1/),
		]);

		fireEvent.click(buttons[0]);
		expect(rowTitles().slice(1)).toEqual([
			expect.stringContaining("Session rev"),
			expect.stringContaining("Session blocked"),
		]);
		fireEvent.click(buttons[0]);
		expect(rowTitles()).toHaveLength(1);
	});

	it("hides the Review tally when no session is in review", () => {
		renderList([session("run", "running")]);

		expect(screen.queryByRole("button", { name: /Review/ })).toBeNull();
	});
});
