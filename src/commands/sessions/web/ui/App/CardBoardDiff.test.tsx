// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { CardBoard } from "./CardBoard";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { DiffPanelsProvider, useDiffPanels } from "./useDiffPanels";

vi.mock("../slashSuggestions/useSuggestedSlashCommands", () => ({
	useSuggestedSlashCommands: () => [],
}));

vi.mock("./CardBoard/CardPaneControls", () => ({
	CardPaneControls: ({ session }: { session: SessionInfo }) => {
		const { togglePanel } = useDiffPanels();
		return (
			<button
				type="button"
				onClick={() =>
					togglePanel(session.id, {
						cwd: session.cwd ?? "",
						conversation: undefined,
						scope: "all",
					})
				}
			>
				diff counts
			</button>
		);
	},
}));

vi.mock("./SessionContent/SessionArea/SessionBody", () => ({
	SessionBody: ({ activeId }: { activeId: string }) => (
		<div data-terminal-session-id={activeId}>
			<textarea aria-label="terminal" />
		</div>
	),
}));

vi.mock(
	"./SessionContent/SessionArea/SessionDiffSplit/DiffPanelColumn",
	() => ({
		DiffPanelColumn: ({ sessionId }: { sessionId: string }) => (
			<div
				data-testid="diff-panel"
				data-diff-session-id={sessionId}
				tabIndex={-1}
			>
				diff
			</div>
		),
	}),
);

vi.mock("./SessionContent/PrPreviewSlideInPane", () => ({
	PrPreviewSlideInPane: () => <div>preview</div>,
}));

let frames: FrameRequestCallback[] = [];

beforeEach(() => {
	frames = [];
	vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
		frames.push(frame);
		return frames.length;
	});
	vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function flushFrames() {
	act(() => {
		for (let i = 0; i < 20 && frames.length > 0; i++) {
			const pending = frames;
			frames = [];
			for (const frame of pending) frame(0);
		}
	});
}

function renderBoard(session: SessionInfo) {
	const socket = {
		sessions: [session],
		selectSession: vi.fn(),
		initialized: new Set(),
		sendInput: vi.fn(),
	} as unknown as SessionSocket;
	render(
		<MemoryRouter>
			<DiffPanelsProvider
				sessionIds={[session.id]}
				onActivateSession={() => {}}
			>
				<CardBoard socket={socket} />
			</DiffPanelsProvider>
		</MemoryRouter>,
	);
	flushFrames();
}

function pressAltD() {
	act(() => {
		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyD",
				altKey: true,
				bubbles: true,
			}),
		);
	});
	flushFrames();
}

const working = makeSessionInfo({
	id: "r",
	status: "running",
	title: "Busy",
	cwd: "/repo",
	lastAssistantMessage: "Refactoring the parser",
});

describe("CardBoard diff panel", () => {
	it("shows and hides the diff panel beside the session from the diff counts", () => {
		renderBoard(working);
		fireEvent.click(screen.getByTestId("working-card"));

		fireEvent.click(screen.getByRole("button", { name: "diff counts" }));
		expect(screen.getByTestId("diff-panel")).toBeTruthy();
		expect(
			screen
				.getByTestId("card-session-view")
				.contains(screen.getByTestId("diff-panel")),
		).toBe(true);

		fireEvent.click(screen.getByRole("button", { name: "diff counts" }));
		expect(screen.queryByTestId("diff-panel")).toBeNull();
	});

	it("Alt+D opens and focuses the diff, then closes it back to the terminal", () => {
		renderBoard(working);
		fireEvent.click(screen.getByTestId("working-card"));
		flushFrames();

		pressAltD();
		expect(document.activeElement).toBe(screen.getByTestId("diff-panel"));

		pressAltD();
		expect(screen.queryByTestId("diff-panel")).toBeNull();
		expect(document.activeElement).toBe(screen.getByLabelText("terminal"));
	});

	it("Alt+D shows a hidden session before opening the diff", () => {
		renderBoard(working);
		fireEvent.click(screen.getByTestId("working-card"));
		fireEvent.click(screen.getByRole("button", { name: "Hide session" }));
		expect(screen.getByTestId("card-last-message")).toBeTruthy();

		pressAltD();

		expect(screen.queryByTestId("card-last-message")).toBeNull();
		expect(document.activeElement).toBe(screen.getByTestId("diff-panel"));
	});

	it("Alt+D focuses a pending preview instead of opening the diff", () => {
		renderBoard(
			makeSessionInfo({
				id: "w",
				status: "waiting",
				title: "Needs input",
				cwd: "/repo",
				pendingPrPreview: {
					requestId: "req-1",
					title: "Pick a colour",
					body: "",
					prNumber: null,
					kind: "question",
				},
			}),
		);
		fireEvent.click(screen.getByTestId("needs-you-card"));
		flushFrames();

		pressAltD();

		expect(document.activeElement).toBe(
			screen.getByText("preview").closest("[data-preview-session-id='w']"),
		);
		expect(screen.queryByTestId("diff-panel")).toBeNull();
	});
});
