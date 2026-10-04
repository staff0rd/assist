// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { isSessionCardFocusHeld } from "../holdSessionCardFocus";
import type { SidebarTab } from "../../types";
import { DiffPanelsProvider, useDiffPanels } from "../useDiffPanels";
import { SidebarCollapsedContext } from "../useSidebarCollapsedContext";
import { useRegionFocusHotkeys } from "./useRegionFocusHotkeys";

const sessions = [makeSessionInfo({ id: "a", cwd: "/repo" })];

function Regions({ tab, collapsed }: { tab: SidebarTab; collapsed: boolean }) {
	const { pathname } = useLocation();
	const panel = useDiffPanels().panelFor("a");
	return (
		<>
			<output aria-label="path">{pathname}</output>
			<output aria-label="tab">{tab}</output>
			{!collapsed && tab === "active" && (
				<button type="button" data-session-id="a">
					card
				</button>
			)}
			{pathname === "/sessions" && (
				<div data-terminal-session-id="a">
					<textarea aria-label="terminal" />
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
		sessions,
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

		expect(isSessionCardFocusHeld()).toBe(true);
	});

	it("Alt+S focuses the active terminal", () => {
		renderShell();
		screen.getByText("card").focus();

		pressAlt("KeyS");

		expect(document.activeElement).toBe(screen.getByLabelText("terminal"));
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
});
