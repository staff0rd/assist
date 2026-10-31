// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionInfo } from "../types";
import { PhoneTabBar } from "./PhoneTabBar";

afterEach(cleanup);

function session(id: string, status: SessionInfo["status"]): SessionInfo {
	return {
		id,
		name: id,
		title: id,
		status,
		commandType: "claude",
		startedAt: 0,
	};
}

function Path() {
	return <div data-testid="path">{useLocation().pathname}</div>;
}

function renderAt(path: string, sessions: SessionInfo[] = []) {
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<MemoryRouter initialEntries={[path]}>
				<PhoneTabBar sessions={sessions} />
				<Path />
			</MemoryRouter>
		</ThemeProvider>,
	);
}

const activeTab = () =>
	screen
		.getAllByRole("button")
		.find((b) => b.getAttribute("aria-current") === "page")?.textContent;

describe("PhoneTabBar", () => {
	it.each([
		["/", "Sessions"],
		["/backlog", "Backlog"],
		["/history", "History"],
	])("shows on %s with %s active", (path, label) => {
		renderAt(path);
		expect(screen.getByTestId("phone-tab-bar")).toBeTruthy();
		expect(activeTab()).toBe(label);
	});

	it.each([
		"/session/abc",
		"/history/abc",
		"/backlog/12",
		"/backlog/12/description",
		"/backlog/12/criteria",
	])("hides on %s", (path) => {
		renderAt(path);
		expect(screen.queryByTestId("phone-tab-bar")).toBeNull();
	});

	it("badges Sessions with the waiting and error count", () => {
		renderAt("/backlog", [
			session("a", "waiting"),
			session("b", "error"),
			session("c", "running"),
			session("d", "done"),
		]);
		expect(screen.getByTestId("phone-tab-badge").textContent).toBe("2");
	});

	it("shows no badge when nothing needs you", () => {
		renderAt("/", [session("c", "running")]);
		expect(screen.queryByTestId("phone-tab-badge")).toBeNull();
	});

	it("navigates to the tapped tab", () => {
		renderAt("/");
		fireEvent.click(screen.getByRole("button", { name: "History" }));
		expect(screen.getByTestId("path").textContent).toBe("/history");
	});
});
