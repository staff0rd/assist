// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";
import type { SessionInfo } from "../../../types";
import type { SessionSocket } from "../../../useSessionSocket";
import { SidebarCollapsedContext } from "../../useSidebarCollapsedContext";

vi.mock("../../AppSidebar/useSidebarOrdering/useSessionViewConfig", () => ({
	useSessionViewConfig: () => ({
		floatWaiting: false,
		floatWaitingAfterMs: 0,
	}),
}));

vi.mock("../../AppSidebar/Sidebar/SidebarBody", () => ({
	SidebarBody: () => <div data-testid="sidebar-body" />,
}));

afterEach(cleanup);

const sessions: SessionInfo[] = [
	{
		id: "a",
		name: "a",
		commandType: "claude",
		startedAt: 0,
		status: "running",
	},
	{
		id: "b",
		name: "b",
		commandType: "claude",
		startedAt: 0,
		status: "waiting",
	},
];

function socketStub(selectSession: (id: string) => void): SessionSocket {
	return {
		sessions,
		history: [],
		pendingLaunches: [],
		activeId: "a",
		initialized: new Set<string>(),
		selectSession,
		resumeSession: () => {},
		viewTranscript: () => {},
		requestHistory: () => {},
		clearTranscript: () => {},
		setStarred: () => {},
		dismissPendingLaunch: () => {},
		retrySession: () => {},
		restartSession: () => {},
		dismissSession: () => {},
		setAutoRun: () => {},
		setAutoAdvance: () => {},
	} as unknown as SessionSocket;
}

function Harness({
	socket,
	initiallyCollapsed,
}: {
	socket: SessionSocket;
	initiallyCollapsed: boolean;
}) {
	const [collapsed, setCollapsed] = useState(initiallyCollapsed);
	return (
		<SidebarCollapsedContext.Provider
			value={{ collapsed, onToggleCollapsed: () => setCollapsed(!collapsed) }}
		>
			<button type="button" onClick={() => setCollapsed(!collapsed)}>
				toggle sidebar
			</button>
			<Routes>
				<Route element={<AppLayout socket={socket} />}>
					<Route
						path="/sessions"
						element={<div data-testid="content">sessions</div>}
					/>
					<Route
						path="/config"
						element={<div data-testid="content">config</div>}
					/>
				</Route>
			</Routes>
		</SidebarCollapsedContext.Provider>
	);
}

function renderLayout({
	collapsed = false,
	route = "/sessions",
	selectSession = vi.fn(),
}: {
	collapsed?: boolean;
	route?: string;
	selectSession?: (id: string) => void;
} = {}) {
	render(
		<MemoryRouter initialEntries={[route]}>
			<Harness
				socket={socketStub(selectSession)}
				initiallyCollapsed={collapsed}
			/>
		</MemoryRouter>,
	);
}

function contentPane(): HTMLElement {
	const pane = screen.getByTestId("content").parentElement;
	if (pane === null) throw new Error("content has no pane");
	return pane;
}

function sidebar(): HTMLElement {
	const pane = contentPane().previousElementSibling;
	if (!(pane instanceof HTMLElement)) throw new Error("no sidebar before pane");
	return pane;
}

function styleOf(el: HTMLElement): CSSStyleDeclaration {
	return globalThis.getComputedStyle(el);
}

function toggleSidebar() {
	fireEvent.click(screen.getByRole("button", { name: "toggle sidebar" }));
}

function hideSidebarButton(): HTMLElement {
	return screen.getByRole("button", { name: "Hide sidebar" });
}

function pressNextWaitingHotkey() {
	fireEvent.keyDown(globalThis.window, { key: ".", ctrlKey: true });
}

describe("AppLayout sidebar collapse", () => {
	it("gives the sidebar a fixed width and a divider when expanded", () => {
		renderLayout();

		expect(styleOf(sidebar()).display).toBe("flex");
		expect(styleOf(sidebar()).width).toBe("400px");
		expect(styleOf(sidebar()).borderRightStyle).toBe("solid");
	});

	it("hides the sidebar with no width or divider when collapsed", () => {
		renderLayout({ collapsed: true });

		expect(styleOf(sidebar()).width).toBe("auto");
		expect(styleOf(sidebar()).borderRightStyle).not.toBe("solid");
		expect(styleOf(sidebar()).display).toBe("none");
	});

	it("leaves the content pane growing to fill the row in both states", () => {
		renderLayout({ collapsed: true });

		expect(styleOf(contentPane()).flexGrow).toBe("1");

		toggleSidebar();

		expect(styleOf(contentPane()).flexGrow).toBe("1");
	});

	it("hides and restores the sidebar as the toggle flips", () => {
		renderLayout();

		toggleSidebar();
		expect(styleOf(sidebar()).display).toBe("none");

		toggleSidebar();
		expect(styleOf(sidebar()).display).toBe("flex");
	});

	it("keeps rendering the routed content while collapsed", () => {
		renderLayout({ collapsed: true, route: "/config" });

		expect(screen.getByTestId("content").textContent).toBe("config");
	});

	it("keeps the sidebar mounted while collapsed", () => {
		renderLayout({ collapsed: true });

		expect(screen.getByTestId("sidebar-body")).toBeDefined();
	});
});

describe("AppLayout sidebar toggle placement", () => {
	it("puts the toggle in the tabs row while expanded", () => {
		renderLayout();

		expect(sidebar().contains(hideSidebarButton())).toBe(true);
	});

	it("collapses the sidebar from its own toggle", () => {
		renderLayout();

		fireEvent.click(hideSidebarButton());

		expect(styleOf(sidebar()).display).toBe("none");
	});

	it("exposes no reachable toggle inside the collapsed sidebar", () => {
		renderLayout({ collapsed: true });

		expect(screen.queryByRole("button", { name: "Hide sidebar" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Show sidebar" })).toBeNull();
	});
});

describe("AppLayout jump-to-next-waiting while collapsed", () => {
	it("selects the next waiting session from the hotkey", () => {
		const selectSession = vi.fn();
		renderLayout({ collapsed: true, selectSession });

		pressNextWaitingHotkey();

		expect(selectSession).toHaveBeenCalledWith("b");
	});

	it("navigates to the sessions route from another route", () => {
		renderLayout({ collapsed: true, route: "/config" });

		pressNextWaitingHotkey();

		expect(screen.getByTestId("content").textContent).toBe("sessions");
	});
});
