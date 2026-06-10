// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionArea } from "./SessionArea";
import type { SessionInfo } from "./types";

// The real terminal pane wires up xterm, which cannot run in jsdom; stub it so
// the test can focus on the loading overlay behaviour.
vi.mock("./TerminalPane", () => ({
	TerminalPane: ({ sessionId }: { sessionId: string }) => (
		<div data-testid={`pane-${sessionId}`} />
	),
}));

afterEach(() => {
	cleanup();
});

const sessions: SessionInfo[] = [
	{
		id: "1",
		name: "first",
		commandType: "claude",
		status: "running",
		startedAt: 0,
	},
	{
		id: "2",
		name: "second",
		commandType: "claude",
		status: "running",
		startedAt: 0,
	},
];

function renderArea(activeId: string | null, initialized: Set<string>) {
	render(
		<SessionArea
			sessions={sessions}
			activeId={activeId}
			initialized={initialized}
			onOutput={() => () => {}}
			sendInput={() => {}}
			sendResize={() => {}}
		/>,
	);
}

describe("SessionArea loading state", () => {
	it("shows a loading indicator for an active session that has not initialized", () => {
		renderArea("2", new Set(["1"]));
		expect(screen.getByText("Starting session…")).toBeTruthy();
	});

	it("hides the loading indicator once the active session has initialized", () => {
		renderArea("2", new Set(["1", "2"]));
		expect(screen.queryByText("Starting session…")).toBeNull();
	});

	it("does not show a loading indicator when there is no active session", () => {
		renderArea(null, new Set());
		expect(screen.queryByText("Starting session…")).toBeNull();
	});
});
