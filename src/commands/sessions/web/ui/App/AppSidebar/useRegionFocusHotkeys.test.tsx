// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { isFocusHeld } from "../holdFocus";
import type { SidebarTab } from "../../types";
import { DiffPanelsProvider, useDiffPanels } from "../useDiffPanels";
import { SidebarCollapsedContext } from "../useSidebarCollapsedContext";
import { useRegionFocusHotkeys } from "./useRegionFocusHotkeys";

const ALL_TOP_BAR_ACTIONS = ["focusAddAgent", "focusVsCode", "focusDone"];
let preview = false;
let topBarActions = ALL_TOP_BAR_ACTIONS;

function Regions({ tab, collapsed }: { tab: SidebarTab; collapsed: boolean }) {
	const { pathname } = useLocation();
	const panel = useDiffPanels().panelFor("a");
	return (
		<>
			<output aria-label="path">{pathname}</output>
			<output aria-label="tab">{tab}</output>
			{!collapsed && tab === "active" && (
				<>
					<button type="button" data-session-id="a">
						card
					</button>
					<button type="button" data-shortcut="focusDone">
						card done
					</button>
				</>
			)}
			{pathname === "/sessions" && (
				<>
					<div data-top-bar-session-id="a">
						{topBarActions.map((action) => (
							<button key={action} type="button" data-shortcut={action}>
								{action}
							</button>
						))}
					</div>
					<div data-terminal-session-id="a">
						<textarea aria-label="terminal" />
					</div>
				</>
			)}
			{pathname === "/backlog" && (
				<div data-backlog-focus="search">
					<input aria-label="search" />
				</div>
			)}
			{pathname.startsWith("/backlog/items/") && (
				<button type="button" data-backlog-focus="back">
					back
				</button>
			)}
			{pathname === "/sessions" && preview && (
				<div data-preview-session-id="a" tabIndex={-1}>
					preview
				</div>
			)}
			{panel && (
				<div data-diff-session-id="a" tabIndex={-1}>
					diff
				</div>
			)}
		</>
	);
}

function Hotkeys({ tab, collapsed }: { tab: SidebarTab; collapsed: boolean }) {
	const [currentTab, setCurrentTab] = useState(tab);
	useRegionFocusHotkeys({
		sessions: [
			makeSessionInfo({
				id: "a",
				cwd: "/repo",
				pendingPrPreview: preview
					? { requestId: "r", title: "t", body: "b", prNumber: null }
					: undefined,
			}),
		],
		activeId: "a",
		tab: currentTab,
		onTabChange: setCurrentTab,
	});
	return <Regions tab={currentTab} collapsed={collapsed} />;
}

function Shell({ tab, collapsed }: { tab: SidebarTab; collapsed: boolean }) {
	const [isCollapsed, setIsCollapsed] = useState(collapsed);
	return (
		<SidebarCollapsedContext.Provider
			value={{
				collapsed: isCollapsed,
				onToggleCollapsed: () => setIsCollapsed((c) => !c),
			}}
		>
			<DiffPanelsProvider sessionIds={["a"]} onActivateSession={() => {}}>
				<Hotkeys tab={tab} collapsed={isCollapsed} />
			</DiffPanelsProvider>
		</SidebarCollapsedContext.Provider>
	);
}

function renderShell({
	path = "/sessions",
	tab = "active",
	collapsed = false,
}: {
	path?: string;
	tab?: SidebarTab;
	collapsed?: boolean;
} = {}) {
	render(
		<MemoryRouter initialEntries={[path]}>
			<Shell tab={tab} collapsed={collapsed} />
		</MemoryRouter>,
	);
}

let frames: FrameRequestCallback[] = [];

function pressAlt(code: string) {
	act(() => {
		document.activeElement?.dispatchEvent(
			new KeyboardEvent("keydown", { code, altKey: true, bubbles: true }),
		);
	});
	act(() => {
		while (frames.length > 0) frames.shift()?.(0);
	});
}

const animate = vi.fn();

beforeEach(() => {
	preview = false;
	topBarActions = ALL_TOP_BAR_ACTIONS;
	frames = [];
	vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
		frames.push(frame);
		return frames.length;
	});
	animate.mockClear();
	HTMLElement.prototype.animate = animate;
	HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("useRegionFocusHotkeys", () => {
	it("Alt+A reveals a collapsed sidebar on the history tab from another route, then focuses the active card", () => {
		renderShell({ path: "/backlog", tab: "history", collapsed: true });

		pressAlt("KeyA");

		expect(screen.getByLabelText("path").textContent).toBe("/sessions");
		expect(screen.getByLabelText("tab").textContent).toBe("active");
		expect(document.activeElement).toBe(screen.getByText("card"));
	});

	it("Alt+A holds card focus so the terminal auto-focus leaves it alone", () => {
		renderShell();

		pressAlt("KeyA");

		expect(isFocusHeld()).toBe(true);
	});

	it("Alt+S focuses the active terminal", () => {
		renderShell();
		screen.getByText("card").focus();

		pressAlt("KeyS");

		expect(document.activeElement).toBe(screen.getByLabelText("terminal"));
	});

	it("Alt+S on the backlog list focuses the search field without leaving the backlog", () => {
		renderShell({ path: "/backlog" });

		pressAlt("KeyS");

		expect(screen.getByLabelText("path").textContent).toBe("/backlog");
		expect(document.activeElement).toBe(screen.getByLabelText("search"));
	});

	it("Alt+S on a backlog item page focuses the back button", () => {
		renderShell({ path: "/backlog/items/a1" });

		pressAlt("KeyS");

		expect(screen.getByLabelText("path").textContent).toBe("/backlog/items/a1");
		expect(document.activeElement).toBe(screen.getByText("back"));
	});

	it("Alt+D opens and focuses the diff, then closes it back to the terminal", () => {
		renderShell();

		pressAlt("KeyD");
		expect(document.activeElement).toBe(screen.getByText("diff"));

		pressAlt("KeyD");
		expect(screen.queryByText("diff")).toBeNull();
		expect(document.activeElement).toBe(screen.getByLabelText("terminal"));
	});

	it("Alt+D focuses an open diff instead of closing it when focus is elsewhere", () => {
		renderShell();
		pressAlt("KeyD");
		screen.getByLabelText("terminal").focus();

		pressAlt("KeyD");

		expect(document.activeElement).toBe(screen.getByText("diff"));
	});

	it("rings the region that receives focus", () => {
		renderShell();

		pressAlt("KeyS");

		const [keyframes] = animate.mock.calls[0] as [Keyframe[]];
		expect(keyframes[0]).toMatchObject({ outlineOffset: "-2px" });
		expect(animate.mock.contexts[0]).toBe(
			screen.getByLabelText("terminal").parentElement,
		);
	});

	it("Alt+D focuses an open preview pane instead of the diff, then returns to the terminal leaving it open", () => {
		preview = true;
		renderShell();
		screen.getByLabelText("terminal").focus();

		pressAlt("KeyD");
		expect(document.activeElement).toBe(screen.getByText("preview"));
		expect(screen.queryByText("diff")).toBeNull();

		pressAlt("KeyD");
		expect(document.activeElement).toBe(screen.getByLabelText("terminal"));
		expect(screen.getByText("preview")).toBeTruthy();
	});

	it.each([
		["KeyZ", "focusAddAgent"],
		["KeyX", "focusVsCode"],
		["KeyC", "focusDone"],
	])(
		"%s focuses the top bar's %s button from another route, holding focus from the terminal",
		(code, action) => {
			renderShell({ path: "/backlog" });

			pressAlt(code);

			expect(screen.getByLabelText("path").textContent).toBe("/sessions");
			expect(document.activeElement).toBe(screen.getByText(action));
			expect(isFocusHeld()).toBe(true);
		},
	);

	it("leaves Tab to move on from a focused top bar button", () => {
		renderShell();
		pressAlt("KeyZ");

		const focused = document.activeElement as HTMLElement;
		expect(focused.tabIndex).toBe(0);
		expect(fireEvent.keyDown(focused, { key: "Tab" })).toBe(true);
	});

	it("does nothing when the top bar lacks the button, even if a card has one", () => {
		topBarActions = ["focusAddAgent"];
		renderShell();
		const terminal = screen.getByLabelText("terminal");
		terminal.focus();

		pressAlt("KeyC");

		expect(document.activeElement).toBe(terminal);
		expect(animate).not.toHaveBeenCalled();
	});
});
