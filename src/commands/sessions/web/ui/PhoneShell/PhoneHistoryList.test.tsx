// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { HistoricalSession, SessionInfo } from "../types";
import { PhoneHistoryList } from "./PhoneHistoryList";
import { PhoneSessionList } from "./PhoneSessionList";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

const worktree = { origin: "/git/assist", clone: "/git/assist-5" };

function entry(
	sessionId: string,
	cwd: string,
	extra: Partial<HistoricalSession> = {},
): HistoricalSession {
	return {
		sessionId,
		name: sessionId,
		title: `History ${sessionId}`,
		project: "",
		cwd,
		timestamp: "2026-11-16T00:00:00Z",
		...extra,
	};
}

const history = [
	entry("a1", "/git/assist"),
	entry("a2", "/git/assist-5", { repoGroup: worktree }),
	entry("o1", "/git/other"),
];

const sessions: SessionInfo[] = [
	{
		id: "o-run",
		name: "o-run",
		title: "Session o-run",
		status: "running",
		commandType: "claude",
		startedAt: 0,
		cwd: "/git/other",
	},
];

function wrap(children: React.ReactNode) {
	return (
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter>{children}</MemoryRouter>
		</ThemeProvider>
	);
}

const historyList = () => (
	<PhoneHistoryList
		history={history}
		localNode="mac"
		requestHistory={() => {}}
	/>
);

const sessionList = () => (
	<PhoneSessionList
		sessions={sessions}
		localNode="mac"
		reconnecting={false}
		onRefresh={() => {}}
	/>
);

const chipNames = () =>
	screen.getAllByRole("radio").map((c) => c.textContent ?? "");
const rows = () =>
	screen
		.getAllByRole("button")
		.map((b) => b.textContent ?? "")
		.filter((t) => t.startsWith("History"));

describe("PhoneHistoryList", () => {
	it("lists chips from history and filters rows, hiding the repo label", () => {
		render(wrap(historyList()));

		expect(chipNames()).toEqual(["All3", "assist2", "other1"]);
		expect(rows()).toHaveLength(3);

		fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
		expect(rows()).toEqual([
			expect.stringContaining("History a1"),
			expect.stringContaining("History a2"),
		]);
		expect(rows().some((r) => r.includes("assist"))).toBe(false);
	});

	it("shows an empty message with Show all repos when the repo has no history", () => {
		localStorage.setItem("assist.phone.repoFilter", "/git/gone");
		render(wrap(historyList()));

		expect(chipNames()).toContain("gone0");
		expect(screen.getByText("No history in gone")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Show all repos" }));
		expect(chipNames()).not.toContain("gone0");
		expect(rows()).toHaveLength(3);
	});

	it("shares the chosen repo with the Sessions tab", () => {
		const { rerender } = render(wrap(sessionList()));
		fireEvent.click(screen.getByRole("radio", { name: /other/ }));

		rerender(wrap(historyList()));
		expect(
			screen.getByRole("radio", { name: /other/ }).getAttribute("aria-checked"),
		).toBe("true");
		expect(rows()).toEqual([expect.stringContaining("History o1")]);

		fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
		rerender(wrap(sessionList()));
		expect(chipNames()).toContain("assist0");
		expect(screen.getByText("No sessions in assist")).toBeTruthy();
	});
});
