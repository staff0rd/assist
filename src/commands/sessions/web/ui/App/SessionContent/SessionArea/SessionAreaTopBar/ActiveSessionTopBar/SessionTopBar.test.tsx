// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionTopBar } from "./SessionTopBar";
import type { SessionInfo } from "../../../../../types";
import { StarredSessionsProvider } from "../../../../useStarredSessions";

let panelWidth = 1200;
let identityWidth = 0;

class TestResizeObserver {
	constructor(private readonly callback: ResizeObserverCallback) {}
	observe() {
		this.callback(
			[{ contentRect: { width: panelWidth } } as ResizeObserverEntry],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}

beforeEach(() => {
	panelWidth = 1200;
	identityWidth = 0;
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
	Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
		configurable: true,
		get: () => identityWidth,
	});
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	Reflect.deleteProperty(globalThis, "ResizeObserver");
	Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth");
	Reflect.deleteProperty(navigator, "clipboard");
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "my session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 90_000,
		runningSince: null,
		...overrides,
	};
}

function renderTopBar(
	info: SessionInfo,
	handlers: {
		onRetry?: () => void;
		onRestart?: () => void;
		onDismiss?: () => void;
		onSetAutoAdvance?: (enabled: boolean) => void;
	} = {},
) {
	render(
		<MemoryRouter>
			<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
				<SessionTopBar
					session={info}
					onRetry={handlers.onRetry}
					onRestart={handlers.onRestart}
					onDismiss={handlers.onDismiss ?? (() => {})}
					onSetAutoRun={() => {}}
					onSetAutoAdvance={handlers.onSetAutoAdvance ?? (() => {})}
				/>
			</StarredSessionsProvider>
		</MemoryRouter>,
	);
}

describe("SessionTopBar", () => {
	it("shows the backlog phase name, elapsed and the restored indicator", () => {
		renderTopBar(
			session({
				subtitle: "a subtitle",
				restored: true,
				activity: {
					kind: "backlog",
					startedAt: 0,
					phaseName: "Phase 2: wire it up",
				},
			}),
		);

		expect(screen.getByText("Phase 2: wire it up")).toBeTruthy();
		expect(screen.getByText("1m 30s")).toBeTruthy();
		expect(screen.getByText("restored")).toBeTruthy();
	});

	it("falls back to the subtitle once the backlog session is done", () => {
		renderTopBar(
			session({
				status: "done",
				subtitle: "a subtitle",
				activity: {
					kind: "backlog",
					startedAt: 0,
					phaseName: "Phase 2: wire it up",
				},
			}),
		);

		expect(screen.getByText("a subtitle")).toBeTruthy();
		expect(screen.queryByText("Phase 2: wire it up")).toBeNull();
	});

	it("puts the status and restored state on the id line", () => {
		renderTopBar(
			session({
				id: "7",
				status: "waiting",
				restored: true,
				claudeSessionId: "conv-1",
			}),
		);

		const idLine = screen.getByText("#7").parentElement;
		expect(screen.getByText("conv-1").parentElement).toBe(idLine);
		expect(screen.getByText("● waiting").parentElement).toBe(idLine);
		expect(screen.getByText("restored").parentElement).toBe(idLine);
		expect(screen.getByText("1m 30s").parentElement).not.toBe(idLine);
	});

	it("says not restored when the session could not be resumed", () => {
		renderTopBar(session({ restored: false }));

		expect(screen.getByText("not restored")).toBeTruthy();
	});

	it("omits the restored indicator when the session has no restore state", () => {
		renderTopBar(session());

		expect(screen.queryByText("restored")).toBeNull();
		expect(screen.queryByText("not restored")).toBeNull();
	});

	it("shows the story name alongside the phase", () => {
		renderTopBar(
			session({
				subtitle: "a subtitle",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemName: "Feature-flag the top bar",
					phaseName: "Phase 3: label the actions",
				},
			}),
		);

		expect(screen.getByText("Feature-flag the top bar")).toBeTruthy();
		expect(screen.getByText("Phase 3: label the actions")).toBeTruthy();
	});

	it("shows the assist session id and the Claude Code conversation id", () => {
		renderTopBar(
			session({
				id: "7",
				claudeSessionId: "2f1c0b8e-dead-beef-cafe-000000000001",
			}),
		);

		expect(screen.getByTitle("assist session 7")).toBeTruthy();
		expect(screen.getByText("#7")).toBeTruthy();
		expect(
			screen.getByText("2f1c0b8e-dead-beef-cafe-000000000001"),
		).toBeTruthy();
		expect(
			screen.getByTitle(
				"Claude Code conversation 2f1c0b8e-dead-beef-cafe-000000000001",
			),
		).toBeTruthy();
	});

	it("leads the id line with the repo the session works in", () => {
		renderTopBar(session({ id: "7", cwd: "/home/me/assist" }));

		const repo = screen.getByText("assist");
		expect(repo.getAttribute("title")).toBe("/home/me/assist");
		expect(
			repo.compareDocumentPosition(screen.getByText("#7")) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("omits the repo for a session that is not repo scoped", () => {
		renderTopBar(
			session({
				commandType: "assist",
				assistArgs: ["update"],
				cwd: "/home/me/assist",
			}),
		);

		expect(screen.queryByText("assist")).toBeNull();
	});

	it("omits the conversation id before the harness reports one", () => {
		renderTopBar(session({ id: "7" }));

		expect(screen.getByText("#7")).toBeTruthy();
		expect(screen.queryByTitle(/Claude Code conversation/)).toBeNull();
	});

	it("links the backlog item ahead of the story name", () => {
		renderTopBar(
			session({
				cwd: "/git/repo",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemId: 1943,
					itemName: "Feature-flag the top bar",
				},
			}),
		);

		const chip = screen.getByRole("link");
		expect(chip.textContent).toBe("a1943");
		expect(chip.getAttribute("href")).toBe(
			"/backlog/items/a1943?cwd=%2Fgit%2Frepo",
		);

		const name = screen.getByText("Feature-flag the top bar");
		expect(
			chip.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("truncates the story name rather than wrapping it", () => {
		renderTopBar(
			session({
				title:
					"A story name long enough that it would never fit beside the bar's buttons",
			}),
		);

		const style = getComputedStyle(
			screen.getByText(
				"A story name long enough that it would never fit beside the bar's buttons",
			),
		);
		expect(style.whiteSpace).toBe("nowrap");
		expect(style.textOverflow).toBe("ellipsis");
		expect(style.overflow).toBe("hidden");
	});

	it("stacks the ids above the story name above the phase", () => {
		renderTopBar(
			session({
				id: "7",
				claudeSessionId: "conv-1",
				subtitle: "Phase 3: label the actions",
				activity: {
					kind: "backlog",
					startedAt: 0,
					itemName: "Feature-flag the top bar",
				},
			}),
		);

		const idRow = screen.getByText("#7").parentElement;
		const titleRow = screen.getByText("Feature-flag the top bar").parentElement;
		const phase = screen.getByText("Phase 3: label the actions");

		expect(screen.getByText("conv-1").parentElement).toBe(idRow);
		expect(titleRow).not.toBe(idRow);
		expect(titleRow?.parentElement).toBe(idRow?.parentElement);
		expect(phase.parentElement).toBe(idRow?.parentElement);
	});
});

describe("SessionTopBar identity", () => {
	const conversationId = "2f1c0b8e-dead-beef-cafe-000000000001";

	function stubClipboard() {
		const writeText = vi.fn(async () => {});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});
		return writeText;
	}

	it("never truncates the worktree name, however narrow the panel", () => {
		panelWidth = 320;
		identityWidth = 900;
		renderTopBar(session({ cwd: "/home/me/a-long-worktree-name" }));

		const style = getComputedStyle(screen.getByText("a-long-worktree-name"));
		expect(style.whiteSpace).toBe("nowrap");
		expect(style.flexShrink).toBe("0");
		expect(style.textOverflow).not.toBe("ellipsis");
		expect(style.overflow).not.toBe("hidden");
	});

	it("floors the identity column at the width the id line needs", () => {
		panelWidth = 1200;
		identityWidth = 420;
		renderTopBar(session({ id: "7", cwd: "/git/repo" }));

		const column = screen.getByText("#7").parentElement?.parentElement;
		expect(getComputedStyle(column as Element).minWidth).toBe("420px");
	});

	it("asks the flex algorithm for the floor and nothing more", () => {
		panelWidth = 1200;
		identityWidth = 420;
		renderTopBar(
			session({
				id: "7",
				title:
					"A story name long enough that its max-content width would dwarf the controls",
			}),
		);

		const column = screen.getByText("#7").parentElement?.parentElement;
		const style = getComputedStyle(column as Element);
		expect(style.flexBasis).toBe("0px");
		expect(style.minWidth).toBe("420px");
	});

	it("keeps the conversation id whole while identity has the room", () => {
		panelWidth = 1200;
		identityWidth = 420;
		renderTopBar(session({ claudeSessionId: conversationId }));

		expect(screen.getByText(conversationId)).toBeTruthy();
	});

	it("collapses the conversation id to a copy affordance when space is tight", () => {
		panelWidth = 420;
		identityWidth = 900;
		renderTopBar(session({ claudeSessionId: conversationId }));

		expect(screen.queryByText(conversationId)).toBeNull();
		const collapsed = screen.getByText("2f1c0b8e");
		expect(collapsed.getAttribute("title")).toBe(
			`Click to copy the full conversation id ${conversationId}`,
		);
		expect(getComputedStyle(collapsed).textOverflow).not.toBe("ellipsis");
	});

	it("copies the full conversation id when the collapsed form is clicked", async () => {
		panelWidth = 420;
		identityWidth = 900;
		const writeText = stubClipboard();
		renderTopBar(session({ claudeSessionId: conversationId }));

		fireEvent.click(screen.getByText("2f1c0b8e"));

		expect(writeText).toHaveBeenCalledWith(conversationId);
		expect(
			await screen.findByTitle("Copied the full conversation id"),
		).toBeTruthy();
	});
});

describe("SessionTopBar control cluster", () => {
	it("wraps its controls rather than shrinking identity", () => {
		panelWidth = 700;
		identityWidth = 900;
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		const controls =
			screen.getByTitle("Dismiss session 1").parentElement?.parentElement;
		const style = getComputedStyle(controls as Element);
		expect(style.flexWrap).toBe("wrap");
		expect(style.justifyContent).toBe("flex-end");
		expect(style.minWidth).toBe("0px");
		expect(style.flexBasis).toBe("auto");
		expect(style.flexShrink).toBe("1");
	});

	it("keeps every control clickable once the cluster has wrapped", () => {
		panelWidth = 700;
		identityWidth = 900;
		const onRetry = vi.fn();
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry,
		});

		expect(screen.getByTitle("Restart session 1")).toBeTruthy();
		expect(screen.getByLabelText("Star")).toBeTruthy();
		expect(screen.getAllByLabelText("Open in VS Code").length).toBeGreaterThan(
			0,
		);

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalled();
	});

	it("never lets the bar scroll sideways", () => {
		panelWidth = 320;
		identityWidth = 900;
		renderTopBar(session({ cwd: "/git/repo" }));

		const bar =
			screen.getByText("#1").parentElement?.parentElement?.parentElement;
		expect(getComputedStyle(bar as Element).overflow).toBe("hidden");
	});
});

describe("SessionTopBar actions", () => {
	it("carries the session's actions", () => {
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.queryByLabelText("Star")).not.toBeNull();
		expect(
			screen.queryAllByLabelText("Open in VS Code").length,
		).toBeGreaterThan(0);
		expect(screen.queryByTitle("Restart session 1")).not.toBeNull();
		expect(screen.queryByTitle("Retry session 1")).not.toBeNull();
	});

	it("invokes the handler behind an action", () => {
		const onRetry = vi.fn();
		renderTopBar(session(), { onRetry });

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalled();
	});

	it("withholds restart from a stopped session so the card can offer it", () => {
		renderTopBar(session({ status: "stopped" }), { onRestart: () => {} });

		expect(screen.queryByTitle("Restart session 1")).toBeNull();
	});

	it("closes a running session with the card's dismiss button", () => {
		renderTopBar(session({ status: "waiting" }));

		expect(screen.queryByTitle("Dismiss session 1")).not.toBeNull();
	});

	it("holds the dismiss button at the bar's right edge", () => {
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		const wrapper = screen.getByTitle("Dismiss session 1").parentElement;
		expect(wrapper?.parentElement?.lastElementChild).toBe(wrapper);
		expect(getComputedStyle(wrapper as Element).flexShrink).toBe("0");
	});

	it("keeps the dismiss button when the bar collapses its labels", () => {
		panelWidth = 400;
		renderTopBar(session());

		expect(screen.getByTitle("Dismiss session 1")).toBeTruthy();
	});

	it("dismisses a done session without confirming, like the card", () => {
		const onDismiss = vi.fn();
		renderTopBar(session({ status: "done" }), { onDismiss });

		fireEvent.click(screen.getByTitle("Dismiss session 1"));

		expect(onDismiss).toHaveBeenCalled();
		expect(screen.queryByText("End session")).toBeNull();
	});

	it("confirms before ending a running session", () => {
		const onDismiss = vi.fn();
		renderTopBar(session(), { onDismiss });

		fireEvent.click(screen.getByTitle("Dismiss session 1"));

		expect(onDismiss).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "End session" }));

		expect(onDismiss).toHaveBeenCalled();
	});

	it("offers no dismiss once the session is stopped", () => {
		renderTopBar(session({ status: "stopped" }));

		expect(screen.queryByTitle("Dismiss session 1")).toBeNull();
	});

	it("offers no dismiss while the session is closing", () => {
		renderTopBar(session({ closing: true }));

		expect(screen.queryByTitle("Dismiss session 1")).toBeNull();
	});
});

describe("SessionTopBar review synthesis", () => {
	function stubSynthesis() {
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: string) => ({
				ok: true,
				status: 200,
				json: async () =>
					url.startsWith("/api/review/synthesis")
						? { synthesis: "## findings" }
						: {},
			})),
		);
	}

	it("carries the review button for a review session", async () => {
		stubSynthesis();
		renderTopBar(
			session({
				commandType: "assist",
				assistArgs: ["review-pr-comments", "12"],
				cwd: "/git/repo",
			}),
		);

		expect(await screen.findByText("Findings")).toBeTruthy();
	});

	it("omits the review button for a session that is not a review", async () => {
		stubSynthesis();
		renderTopBar(session({ cwd: "/git/repo" }));

		expect(screen.queryByText("Findings")).toBeNull();
		await waitFor(() => expect(fetch).toHaveBeenCalled());
		expect(screen.queryByText("Findings")).toBeNull();
	});
});

describe("SessionTopBar toggles", () => {
	it("carries the backlog session's continue switch", () => {
		const onSetAutoAdvance = vi.fn();
		renderTopBar(
			session({
				activity: { kind: "backlog", startedAt: 0, phase: 1, totalPhases: 3 },
			}),
			{ onSetAutoAdvance },
		);

		expect(screen.getByText("Continue")).toBeTruthy();

		fireEvent.click(screen.getByRole("switch"));

		expect(onSetAutoAdvance).toHaveBeenCalledWith(false);
	});

	it("offers no switch for a session with nothing to advance", () => {
		renderTopBar(session());

		expect(screen.queryByRole("switch")).toBeNull();
	});
});

describe("SessionTopBar action labels", () => {
	it("labels its actions when the panel is wide", () => {
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.getByText("Restart")).toBeTruthy();
		expect(screen.getByText("Retry")).toBeTruthy();
		expect(screen.getByText("Star")).toBeTruthy();
		expect(screen.getByText("VS Code")).toBeTruthy();
	});

	it("collapses to icons when the panel is narrow", () => {
		panelWidth = 400;
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.queryByText("Restart")).toBeNull();
		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.queryByText("Star")).toBeNull();
		expect(screen.queryByText("VS Code")).toBeNull();
	});

	it("collapses on the space left after identity, not the bar width", () => {
		panelWidth = 900;
		identityWidth = 500;
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.queryByText("Restart")).toBeNull();
		expect(screen.getByTitle("Restart session 1")).toBeTruthy();
	});

	it("keeps its labels at that same bar width when identity is short", () => {
		panelWidth = 900;
		identityWidth = 200;
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry: () => {},
		});

		expect(screen.getByText("Restart")).toBeTruthy();
	});

	it("keeps every action reachable once collapsed", () => {
		panelWidth = 400;
		const onRetry = vi.fn();
		renderTopBar(session({ cwd: "/git/repo" }), {
			onRestart: () => {},
			onRetry,
		});

		expect(screen.getByTitle("Restart session 1")).toBeTruthy();
		expect(screen.getByLabelText("Star")).toBeTruthy();
		expect(screen.getAllByLabelText("Open in VS Code").length).toBeGreaterThan(
			0,
		);

		fireEvent.click(screen.getByTitle("Retry session 1"));

		expect(onRetry).toHaveBeenCalled();
	});
});
