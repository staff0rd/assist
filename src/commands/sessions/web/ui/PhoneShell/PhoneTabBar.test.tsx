// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
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
	const { pathname, search } = useLocation();
	return <div data-testid="path">{pathname + search}</div>;
}

let go: (path: string) => void;
let back: () => void;

function Go() {
	const navigate = useNavigate();
	go = (path) => act(() => navigate(path));
	back = () => act(() => navigate(-1));
	return null;
}

function renderAt(path: string, sessions: SessionInfo[] = []) {
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<MemoryRouter initialEntries={[path]}>
				<PhoneTabBar sessions={sessions} />
				<Path />
				<Go />
			</MemoryRouter>
		</ThemeProvider>,
	);
}

const tap = (label: string) =>
	fireEvent.click(screen.getByRole("button", { name: label }));
const path = () => screen.getByTestId("path").textContent;

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
		tap("History");
		expect(path()).toBe("/history");
	});

	it("returns to the last screen open in a tab", () => {
		renderAt("/");
		go("/session/abc");
		go("/backlog/12?cwd=%2Frepo");
		go("/backlog");
		tap("Sessions");
		expect(path()).toBe("/session/abc");
		go("/");
		tap("Backlog");
		expect(path()).toBe("/backlog");
	});

	it("keeps each tab's last screen independently", () => {
		renderAt("/");
		go("/history/abc");
		go("/history");
		go("/backlog/12/criteria?cwd=%2Frepo");
		go("/");
		tap("Backlog");
		expect(path()).toBe("/backlog/12/criteria?cwd=%2Frepo");
	});

	it("puts the tab's root under a restored screen so back stays in the tab", () => {
		renderAt("/backlog?repo=origin");
		go("/backlog/12?cwd=%2Frepo");
		go("/session/abc");
		go("/");
		tap("Backlog");
		expect(path()).toBe("/backlog/12?cwd=%2Frepo");
		back();
		expect(path()).toBe("/backlog?repo=origin");
	});

	it("returns the active tab to its root list on re-tap", () => {
		renderAt("/backlog?repo=origin");
		go("/backlog/12");
		go("/backlog?repo=origin");
		tap("Backlog");
		expect(path()).toBe("/backlog?repo=origin");
		go("/");
		tap("Backlog");
		expect(path()).toBe("/backlog?repo=origin");
	});
});
