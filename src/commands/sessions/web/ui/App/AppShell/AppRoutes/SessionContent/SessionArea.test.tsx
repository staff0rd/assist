// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import { SessionArea } from "./SessionArea";
import type { SessionInfo, SessionListHandlers } from "../../../../types";
import { DiffPanelsProvider, useDiffPanels } from "../useDiffPanels";
import { StarredSessionsProvider } from "../useStarredSessions";
import { TopBarLayoutContext } from "../../useTopBarLayoutContext";

// The real terminal pane wires up xterm, which cannot run in jsdom; stub it so
// the test can focus on the loading overlay behaviour.
vi.mock("./SessionArea/TerminalArea/TerminalPanes/TerminalPane", () => ({
	TerminalPane: ({ sessionId }: { sessionId: string }) => (
		<div data-testid={`pane-${sessionId}`} />
	),
}));

vi.mock(
	"./SessionArea/SessionPreviewSplit/PrPreviewSplit/PrPreviewSlideIn/PrPreviewSlideInPane/PrPreviewPane",
	() => ({
		PrPreviewPane: () => <div data-testid="preview-pane" />,
	}),
);

vi.mock("../DiffContent", () => ({
	DiffContent: ({
		mode,
		onToggleMode,
	}: {
		mode?: string;
		onToggleMode?: () => void;
	}) => (
		<div data-testid="diff" data-mode={mode}>
			<button type="button" onClick={onToggleMode}>
				toggle mode
			</button>
		</div>
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

function renderArea(
	activeId: string | null,
	initialized: Set<string>,
	list: SessionInfo[] = sessions,
) {
	render(
		<DiffPanelsProvider sessionIds={[]} onActivateSession={() => {}}>
			<SessionArea
				sessions={list}
				activeId={activeId}
				initialized={initialized}
				onOutput={() => () => {}}
				sendInput={() => {}}
				sendResize={() => {}}
				lifecycle={{
					onRetry: () => {},
					onRestart: () => {},
					onDismiss: () => {},
					onSetAutoRun: () => {},
					onSetAutoAdvance: () => {},
				}}
				viewingTranscriptSessionId={null}
				transcript={null}
				sendPrDecision={() => {}}
			/>
		</DiffPanelsProvider>,
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

	it("does not show a loading indicator for a stopped session with no process", () => {
		renderArea("3", new Set(), [
			{
				id: "3",
				name: "held",
				commandType: "claude",
				status: "stopped",
				startedAt: 0,
				undurable: { reason: "uncommitted changes" },
			},
		]);
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
				sendPrDecision={() => {}}
				lifecycle={{
					onRetry: () => {},
					onRestart: () => {},
					onDismiss: () => {},
					onSetAutoRun: () => {},
					onSetAutoAdvance: () => {},
				}}
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
				sendPrDecision={() => {}}
				lifecycle={{
					onRetry: () => {},
					onRestart: () => {},
					onDismiss: () => {},
					onSetAutoRun: () => {},
					onSetAutoAdvance: () => {},
				}}
				transcript={null}
			/>,
		);
		expect(screen.queryByText("No transcript available")).toBeNull();
		expect(screen.queryByTestId("pane-1")).toBeNull();
	});
});

function barSession(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "my session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 5_000,
		runningSince: null,
		subtitle: "first subtitle",
		...overrides,
	};
}

const pendingPreview: PrPreview = {
	requestId: "req-1",
	title: "a preview",
	body: "body",
	prNumber: null,
};

function OpenDiffButton({ sessionId }: { sessionId: string }) {
	const { togglePanel } = useDiffPanels();
	return (
		<button
			type="button"
			onClick={() => togglePanel(sessionId, { cwd: "/repo", scope: "all" })}
		>
			open diff
		</button>
	);
}

function renderWithTopBar(
	topBar: boolean,
	list: SessionInfo[],
	activeId: string,
	{
		lifecycle = {},
		viewingTranscriptSessionId = null,
	}: {
		lifecycle?: Partial<SessionListHandlers>;
		viewingTranscriptSessionId?: string | null;
	} = {},
) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
				<DiffPanelsProvider
					sessionIds={list.map((s) => s.id)}
					onActivateSession={() => {}}
				>
					<OpenDiffButton sessionId={activeId} />
					<SessionArea
						sessions={list}
						activeId={activeId}
						initialized={new Set(list.map((s) => s.id))}
						onOutput={() => () => {}}
						sendInput={vi.fn()}
						sendResize={vi.fn()}
						viewingTranscriptSessionId={viewingTranscriptSessionId}
						transcript={null}
						sendPrDecision={vi.fn()}
						lifecycle={{
							onRetry: vi.fn(),
							onRestart: vi.fn(),
							onDismiss: vi.fn(),
							onSetAutoRun: vi.fn(),
							onSetAutoAdvance: vi.fn(),
							...lifecycle,
						}}
					/>
				</DiffPanelsProvider>
			</StarredSessionsProvider>
		</TopBarLayoutContext.Provider>,
	);
}

function nearestAncestorOfTerminalAndPreview(): HTMLElement {
	const terminal = screen.getByTestId("pane-1");
	let node = screen.getByTestId("preview-pane").parentElement;
	while (node && !node.contains(terminal)) node = node.parentElement;
	if (node === null) throw new Error("terminal and preview share no ancestor");
	return node;
}

describe("SessionArea top bar", () => {
	it("shows the active session's phase and elapsed when the flag is on", () => {
		renderWithTopBar(true, [barSession()], "1");

		expect(screen.getByText("first subtitle")).toBeTruthy();
		expect(screen.getByText("5s")).toBeTruthy();
	});

	it("renders no top bar when the flag is off", () => {
		renderWithTopBar(false, [barSession()], "1");

		expect(screen.queryByText("first subtitle")).toBeNull();
		expect(screen.queryByText("5s")).toBeNull();
	});

	it("renders no top bar when no session is active", () => {
		renderWithTopBar(true, [barSession()], "other");

		expect(screen.queryByText("first subtitle")).toBeNull();
	});

	it("renders no top bar in the transcript view", () => {
		renderWithTopBar(true, [barSession()], "1", {
			viewingTranscriptSessionId: "abc",
		});

		expect(screen.queryByText("first subtitle")).toBeNull();
		expect(screen.queryByTitle("Restart session 1")).toBeNull();
	});

	it("follows the active session when it changes", () => {
		const list = [
			barSession(),
			barSession({ id: "2", subtitle: "second subtitle", runningMs: 65_000 }),
		];
		renderWithTopBar(true, list, "2");

		expect(screen.getByText("second subtitle")).toBeTruthy();
		expect(screen.getByText("1m 5s")).toBeTruthy();
		expect(screen.queryByText("first subtitle")).toBeNull();
	});

	it("sits above the split rather than inside it when a preview is open", () => {
		renderWithTopBar(
			true,
			[barSession({ pendingPrPreview: pendingPreview })],
			"1",
		);

		const split = nearestAncestorOfTerminalAndPreview();
		const caption = screen.getByText("first subtitle");

		expect(split.contains(caption)).toBe(false);
		expect(
			caption.compareDocumentPosition(split) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});
});

describe("SessionArea last message", () => {
	it("shows the active session's last prompt beside the bar", () => {
		renderWithTopBar(
			true,
			[barSession({ lastUserMessage: "fix the failing test" })],
			"1",
		);

		expect(screen.getByTestId("session-last-message").textContent).toBe(
			"fix the failing test",
		);
	});

	it("collapses a multi-line prompt onto one line", () => {
		renderWithTopBar(
			true,
			[barSession({ lastUserMessage: "first line\n\nsecond line" })],
			"1",
		);

		expect(screen.getByTestId("session-last-message").textContent).toBe(
			"first line second line",
		);
	});

	it("renders nothing when the session has no prompt yet", () => {
		renderWithTopBar(true, [barSession()], "1");

		expect(screen.queryByTestId("session-last-message")).toBeNull();
	});

	it("renders nothing when the top bar is hidden", () => {
		renderWithTopBar(
			false,
			[barSession({ lastUserMessage: "fix the failing test" })],
			"1",
		);

		expect(screen.queryByTestId("session-last-message")).toBeNull();
	});
});

function terminalColumn(): HTMLElement {
	const diff = screen.getByTestId("diff");
	let column = screen.getByTestId("pane-1");
	while (column.parentElement && !column.parentElement.contains(diff))
		column = column.parentElement;
	return column;
}

function openDiff() {
	fireEvent.click(screen.getByRole("button", { name: "open diff" }));
}

describe("SessionArea last message beside the diff panel", () => {
	it("stays within the terminal column so the diff toolbar keeps its controls", () => {
		renderWithTopBar(
			true,
			[barSession({ lastUserMessage: "fix the failing test" })],
			"1",
		);

		openDiff();

		const column = terminalColumn();
		expect(column.contains(screen.getByTestId("session-last-message"))).toBe(
			true,
		);
		expect(column.contains(screen.getByTestId("diff"))).toBe(false);
	});

	it("goes away with the terminal when the diff fills the area", () => {
		renderWithTopBar(
			true,
			[barSession({ lastUserMessage: "fix the failing test" })],
			"1",
		);

		openDiff();
		fireEvent.click(screen.getByRole("button", { name: "toggle mode" }));

		const column = terminalColumn();
		expect(column.contains(screen.getByTestId("session-last-message"))).toBe(
			true,
		);
		expect(getComputedStyle(column).display).toBe("none");
	});

	it("hugs the left edge of the terminal, away from every right-hand panel", () => {
		renderWithTopBar(
			true,
			[barSession({ lastUserMessage: "fix the failing test" })],
			"1",
		);

		openDiff();

		const readout = screen.getByTestId("session-last-message");
		expect(getComputedStyle(readout).top).toBe("0px");
		expect(getComputedStyle(readout).left).toBe("0px");
		expect(getComputedStyle(readout).right).toBe("auto");
	});
});

describe("SessionArea top bar actions", () => {
	it("restarts the active session", () => {
		const onRestart = vi.fn();
		renderWithTopBar(true, [barSession(), barSession({ id: "2" })], "2", {
			lifecycle: { onRestart },
		});

		fireEvent.click(screen.getByTitle("Restart session 2"));
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(onRestart).toHaveBeenCalledWith("2");
	});

	it("retries the active session", () => {
		const onRetry = vi.fn();
		renderWithTopBar(true, [barSession({ commandType: "run" })], "1", {
			lifecycle: { onRetry },
		});

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalledWith("1");
	});

	it("offers no retry on a session that cannot be retried", () => {
		renderWithTopBar(true, [barSession()], "1");

		expect(screen.queryByTitle("Retry session 1")).toBeNull();
	});

	it("keeps the actions out of the session area when the flag is off", () => {
		renderWithTopBar(false, [barSession()], "1");

		expect(screen.queryByTitle("Restart session 1")).toBeNull();
	});

	it("advances the active session's continue switch", () => {
		const onSetAutoAdvance = vi.fn();
		const backlog = (id: string) =>
			barSession({
				id,
				activity: { kind: "backlog", startedAt: 0, phase: 1, totalPhases: 3 },
			});
		renderWithTopBar(true, [backlog("1"), backlog("2")], "2", {
			lifecycle: { onSetAutoAdvance },
		});

		fireEvent.click(screen.getByRole("switch"));

		expect(onSetAutoAdvance).toHaveBeenCalledWith("2", false);
	});

	it("dismisses the active session from the bar", () => {
		const onDismiss = vi.fn();
		renderWithTopBar(true, [barSession({ status: "done" })], "1", {
			lifecycle: { onDismiss },
		});

		fireEvent.click(screen.getByTitle("Dismiss session 1"));

		expect(onDismiss).toHaveBeenCalledWith("1");
	});
});
