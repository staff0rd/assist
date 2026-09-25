// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppToolbar } from "./AppToolbar";
import type { RepoSelection } from "../../useRepoSelectionContext";
import type { SessionSocket } from "../../useSessionSocket";
import { SidebarCollapsedContext } from "../useSidebarCollapsedContext";

vi.mock("./AppToolbar/NavTabs", () => ({ NavTabs: () => <div /> }));
vi.mock("./AppToolbar/RepoPicker", () => ({ RepoPicker: () => <div /> }));
vi.mock("../OpenInCodeButton", () => ({ OpenInCodeButton: () => <div /> }));
vi.mock("./AppToolbar/OpenInGitHubButton", () => ({
	OpenInGitHubButton: () => <div />,
}));
vi.mock("./AppToolbar/TopNavActions", () => ({ TopNavActions: () => <div /> }));
vi.mock("./AppToolbar/RateLimitsIndicator", () => ({
	RateLimitsIndicator: () => <div />,
}));
vi.mock("./AppToolbar/RefreshWebserverButton", () => ({
	RefreshWebserverButton: () => <div />,
}));

afterEach(cleanup);

const selection: RepoSelection = {
	repos: [],
	selectedCwd: "",
	worktreeCwd: "",
	setSelectedCwd: () => {},
};

const socket = { reconnecting: false } as unknown as SessionSocket;

function renderToolbar({
	collapsed,
	onToggleCollapsed = vi.fn(),
}: {
	collapsed: boolean;
	onToggleCollapsed?: () => void;
}) {
	render(
		<SidebarCollapsedContext.Provider value={{ collapsed, onToggleCollapsed }}>
			<AppToolbar socket={socket} selection={selection} />
		</SidebarCollapsedContext.Provider>,
	);
}

describe("AppToolbar sidebar toggle", () => {
	it("offers the toggle while the sidebar is collapsed", () => {
		renderToolbar({ collapsed: true });

		const button = screen.getByRole("button", { name: "Show sidebar" });

		expect(button.getAttribute("aria-pressed")).toBe("false");
	});

	it("expands the sidebar when the toggle is clicked", () => {
		const onToggleCollapsed = vi.fn();
		renderToolbar({ collapsed: true, onToggleCollapsed });

		fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));

		expect(onToggleCollapsed).toHaveBeenCalledOnce();
	});

	it("drops the toggle while the sidebar is expanded", () => {
		renderToolbar({ collapsed: false });

		expect(screen.queryByRole("button", { name: "Show sidebar" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Hide sidebar" })).toBeNull();
	});
});
