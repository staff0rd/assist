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
});
