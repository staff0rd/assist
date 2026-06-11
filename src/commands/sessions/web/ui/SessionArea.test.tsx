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
			viewingTranscriptSessionId={null}
			transcript={null}
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

describe("SessionArea transcript view", () => {
	it("renders the transcript instead of terminals when one is being viewed", () => {
		render(
			<SessionArea
				sessions={sessions}
				activeId="1"
				initialized={new Set(["1"])}
				onOutput={() => () => {}}
				sendInput={() => {}}
				sendResize={() => {}}
				viewingTranscriptSessionId="abc"
				transcript={{
					sessionId: "abc",
					messages: [
						{ role: "user", text: "hello there" },
						{ role: "tool", tool: "Read", target: "/tmp/x.ts" },
						{ role: "assistant", text: "done" },
					],
				}}
			/>,
		);
		expect(screen.getByText("hello there")).toBeTruthy();
		expect(screen.getByText("Read")).toBeTruthy();
		expect(screen.getByText("done")).toBeTruthy();
		expect(screen.queryByTestId("pane-1")).toBeNull();
	});

	it("shows a spinner until the transcript for the viewed session arrives", () => {
		render(
			<SessionArea
				sessions={sessions}
				activeId="1"
				initialized={new Set(["1"])}
				onOutput={() => () => {}}
				sendInput={() => {}}
				sendResize={() => {}}
				viewingTranscriptSessionId="abc"
				transcript={null}
			/>,
		);
		expect(screen.queryByText("No transcript available")).toBeNull();
		expect(screen.queryByTestId("pane-1")).toBeNull();
	});
});
