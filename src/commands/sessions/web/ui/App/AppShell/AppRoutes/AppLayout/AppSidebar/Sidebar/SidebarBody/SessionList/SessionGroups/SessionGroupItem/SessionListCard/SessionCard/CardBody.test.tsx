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
import { CardBody } from "./CardBody";
import type { SessionInfo } from "../../../../../../../../../../../../types";
import { DiffPanelsProvider } from "../../../../../../../../../useDiffPanels";
import { TopBarLayoutContext } from "../../../../../../../../../../useTopBarLayoutContext";

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({
			json: async () => ({
				new: ["a.ts"],
				modified: ["b.ts", "c.ts"],
				deleted: [],
			}),
		})),
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "5",
		name: "assist draft --once something",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		cwd: "/git/repo-2",
		...overrides,
	};
}

function renderBody(
	s: SessionInfo,
	loading: boolean,
	onActivateSession: (id: string) => void = vi.fn(),
	topBar?: boolean,
) {
	const body = (
		<MemoryRouter>
			<DiffPanelsProvider sessionIds={[]} onActivateSession={onActivateSession}>
				<CardBody
					session={s}
					loading={loading}
					onSetAutoRun={vi.fn()}
					onSetAutoAdvance={vi.fn()}
				/>
			</DiffPanelsProvider>
		</MemoryRouter>
	);
	if (topBar === undefined) return render(body);
	return render(
		<TopBarLayoutContext.Provider value={topBar}>
			{body}
		</TopBarLayoutContext.Provider>,
	);
}

describe("CardBody while busy", () => {
	it("leaves no bottom row for a session that is booting", () => {
		const { container } = renderBody(session(), true);

		expect(container.innerHTML).toBe("");
		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.queryByText("Starting…")).toBeNull();
	});

	it("leaves no bottom row while the worktree is being torn down", () => {
		const { container } = renderBody(session({ closing: true }), true);

		expect(container.innerHTML).toBe("");
		expect(screen.queryByText("Closing…")).toBeNull();
	});
});

describe("CardBody meta line", () => {
	it("names the repo as plain text once the activity resolves", () => {
		renderBody(session({ activity: { kind: "command", startedAt: 0 } }), false);

		const repo = screen.getByText("repo-2");
		expect(repo.closest(".MuiChip-root")).toBeNull();
	});

	it("holds the meta line back while the activity is still unknown", () => {
		renderBody(session(), false);

		expect(screen.queryByText("repo-2")).toBeNull();
	});

	const phased = () =>
		session({
			activity: { kind: "backlog", startedAt: 0, phaseName: "Phase 1: flag" },
		});

	it("shows the phase caption in the default layout", () => {
		renderBody(phased(), false, vi.fn(), false);

		expect(screen.getByText("Phase 1: flag")).toBeTruthy();
	});

	it("drops the phase caption when the top bar owns it", () => {
		renderBody(phased(), false, vi.fn(), true);

		expect(screen.queryByText("Phase 1: flag")).toBeNull();
	});
});

describe("CardBody status caption", () => {
	const preview = {
		requestId: "req-1",
		title: "Bug title",
		body: "body",
		prNumber: null,
		kind: "backlog-item" as const,
	};

	it("says waiting while a proposed item sits in the preview pane", () => {
		renderBody(session({ pendingPrPreview: preview }), false);

		expect(screen.getByText("● waiting")).toBeTruthy();
		expect(screen.queryByText("● running")).toBeNull();
	});

	it("says running once the preview has been decided", () => {
		renderBody(session(), false);

		expect(screen.getByText("● running")).toBeTruthy();
	});
});

describe("CardBody git status counts", () => {
	it("shows the card's own working-tree counts", async () => {
		renderBody(session(), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.getByText("~2")).toBeTruthy();
		expect(screen.queryByText("-0")).toBeNull();
	});

	it("activates the card's session when its counts are clicked", async () => {
		const onActivateSession = vi.fn();
		renderBody(session(), false, onActivateSession);

		fireEvent.click(await screen.findByText("+1"));

		expect(onActivateSession).toHaveBeenCalledWith("5");
	});

	it("carries the claude session id into the counts request", async () => {
		renderBody(session({ claudeSessionId: "sess-1" }), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(fetch).toHaveBeenCalledWith(
			"/api/git-status?cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});

	it("shows no counts while the card is starting or closing", async () => {
		const { container } = renderBody(session({ closing: true }), true);

		await waitFor(() => expect(container.innerHTML).toBe(""));
		expect(screen.queryByText("+1")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("CardBody review button", () => {
	it("leaves the review button to the session action row", async () => {
		renderBody(session({ assistArgs: ["review-pr-comments", "12"] }), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.queryByText("Findings")).toBeNull();
	});
});

describe("CardBody top bar layout", () => {
	function renderWithTopBar(topBar: boolean) {
		render(
			<MemoryRouter>
				<TopBarLayoutContext.Provider value={topBar}>
					<DiffPanelsProvider sessionIds={[]} onActivateSession={vi.fn()}>
						<CardBody
							session={session({ runningMs: 65_000, restored: true })}
							loading={false}
							onSetAutoRun={vi.fn()}
							onSetAutoAdvance={vi.fn()}
						/>
					</DiffPanelsProvider>
				</TopBarLayoutContext.Provider>
			</MemoryRouter>,
		);
	}

	it("keeps the elapsed time and status words in the default layout", async () => {
		renderWithTopBar(false);

		expect(screen.getByText("1m 5s")).toBeTruthy();
		expect(screen.getByText("restored")).toBeTruthy();
		expect(screen.getByText("● running")).toBeTruthy();
		expect(await screen.findByText("+1")).toBeTruthy();
	});

	it("keeps only the diff counts when the top bar owns the rest", async () => {
		renderWithTopBar(true);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.queryByText("1m 5s")).toBeNull();
		expect(screen.queryByText("restored")).toBeNull();
		expect(screen.queryByText("● running")).toBeNull();
	});
});
