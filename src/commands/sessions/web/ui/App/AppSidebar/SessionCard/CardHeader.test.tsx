// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CardHeader } from "./CardHeader";
import type { SessionInfo } from "../../../types";
import { DiffPanelsProvider } from "../../useDiffPanels";
import { StarredSessionsProvider } from "../../useStarredSessions";
import { TopBarLayoutContext } from "../../useTopBarLayoutContext";

afterEach(cleanup);

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			<DiffPanelsProvider sessionIds={[]} onActivateSession={() => {}}>
				{children}
			</DiffPanelsProvider>
		</StarredSessionsProvider>
	);
}

describe("CardHeader title", () => {
	it("clamps the title to a single line with an ellipsis", () => {
		render(
			<CardHeader session={session} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		const style = getComputedStyle(screen.getByText("my session"));
		expect(style.whiteSpace).toBe("nowrap");
		expect(style.textOverflow).toBe("ellipsis");
		expect(style.overflow).toBe("hidden");
	});

	it("shares the row-1 container with the actions, spanning past the data line column", () => {
		render(
			<CardHeader session={session} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		const title = screen.getByText("my session");
		const row = title.parentElement as HTMLElement;
		const rowStyle = getComputedStyle(row);
		expect(row.contains(screen.getByTitle("Dismiss session 1"))).toBe(true);
		expect(rowStyle.gridColumn.replace(/\s/g, "")).toBe("2/-1");
		expect(rowStyle.display).toBe("flex");
		expect(getComputedStyle(title).minWidth).toBe("0px");
	});

	it("keeps a long untruncated title on one line", () => {
		const wordy: SessionInfo = {
			...session,
			name: "the login page redirects to the wrong place every single time",
		};
		render(
			<CardHeader session={wordy} loading={false} onDismiss={() => {}} />,
			{
				wrapper: Stars,
			},
		);

		const style = getComputedStyle(screen.getByText(wordy.name));
		expect(style.whiteSpace).toBe("nowrap");
		expect(style.textOverflow).toBe("ellipsis");
	});
});

describe("CardHeader loading", () => {
	it("replaces the status glyph with a spinner while starting", () => {
		const starting: SessionInfo = { ...session, cwd: "/home/me/repo" };
		render(<CardHeader session={starting} loading onDismiss={() => {}} />, {
			wrapper: Stars,
		});

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByTitle("running")).toBeNull();
	});

	it("shows the status glyph and no spinner once loaded", () => {
		const loaded: SessionInfo = { ...session, cwd: "/home/me/repo" };
		render(
			<CardHeader session={loaded} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
	});

	it("keeps the spinner for an assist session until its activity resolves", () => {
		const pending: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["next-backlog-item"],
			cwd: "/home/me/repo",
		};
		render(
			<CardHeader session={pending} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByTitle("running")).toBeNull();
	});

	it("leaves the awaiting-activity spinner bare, with no busy caption", () => {
		const pending: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["next-backlog-item"],
			cwd: "/home/me/repo",
		};
		render(
			<CardHeader session={pending} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.queryByText("Closing…")).toBeNull();
	});

	it("shows the glyph once an assist session's activity arrives", () => {
		const resolved: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["next-backlog-item"],
			cwd: "/home/me/repo",
			activity: { kind: "command", startedAt: 0 },
		};
		render(
			<CardHeader session={resolved} loading={false} onDismiss={() => {}} />,
			{ wrapper: Stars },
		);

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
	});

	it("does not hang the spinner on a finished assist session with no activity", () => {
		const done: SessionInfo = {
			...session,
			commandType: "assist",
			assistArgs: ["draft"],
			cwd: "/home/me/repo",
			status: "done",
		};
		render(<CardHeader session={done} loading={false} onDismiss={() => {}} />, {
			wrapper: Stars,
		});

		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.getByTitle("done")).toBeTruthy();
	});
});

describe("CardHeader verify ring", () => {
	function renderSession(overrides: Partial<SessionInfo>, loading = false) {
		return render(
			<CardHeader
				session={{ ...session, cwd: "/home/me/repo", ...overrides }}
				loading={loading}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
	}

	it("rings the running dot while the session is verifying", () => {
		const { container } = renderSession({ verifying: true });

		expect(screen.getByTitle("verifying")).toBeTruthy();
		expect(container.querySelector(".verify-ring")).toBeTruthy();
	});

	it("draws the ring concentric with the dot it surrounds", () => {
		const { container } = renderSession({ verifying: true });

		const dot = container.querySelector("circle:not(.verify-ring)");
		const ring = container.querySelector(".verify-ring");

		expect(ring?.getAttribute("cx")).toBe(dot?.getAttribute("cx"));
		expect(ring?.getAttribute("cy")).toBe(dot?.getAttribute("cy"));
	});

	it("reverts to the plain dot once verify finishes", () => {
		const { container } = renderSession({ verifying: false });

		expect(screen.queryByTitle("verifying")).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
		expect(container.querySelector(".verify-ring")).toBeNull();
	});

	it("leaves the waiting glyph in place for a session awaiting a pr preview", () => {
		renderSession({
			verifying: true,
			pendingPrPreview: {
				requestId: "r1",
				title: "t",
				body: "b",
				prNumber: null,
			},
		});

		expect(screen.queryByTitle("verifying")).toBeNull();
		expect(screen.getByTitle("waiting").textContent).toBe("◆");
	});

	it("yields to the starting spinner", () => {
		renderSession({ verifying: true }, true);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByTitle("verifying")).toBeNull();
	});
});

describe("CardHeader busy caption", () => {
	function renderBusy(overrides: Partial<SessionInfo> = {}) {
		render(
			<CardHeader
				session={{ ...session, cwd: "/home/me/repo", ...overrides }}
				loading
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
	}

	it("says Starting beside the single spinner for a booting session", () => {
		renderBusy();

		expect(screen.getAllByRole("progressbar").length).toBe(1);
		expect(screen.getByText("Starting…")).toBeTruthy();
		expect(screen.queryByText("Closing…")).toBeNull();
	});

	it("says Closing while the worktree is being torn down", () => {
		renderBusy({ closing: true });

		expect(screen.getAllByRole("progressbar").length).toBe(1);
		expect(screen.getByText("Closing…")).toBeTruthy();
		expect(screen.queryByText("Starting…")).toBeNull();
	});
});

describe("CardHeader status glyph", () => {
	const busy: SessionInfo = { ...session, cwd: "/home/me/repo", usedPct: 42 };

	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				json: async () => ({ new: ["a.ts"], modified: [], deleted: [] }),
			})),
		);
	});

	afterEach(() => vi.unstubAllGlobals());

	function renderHeader(topBar: boolean, loading = false) {
		render(
			<MemoryRouter>
				<TopBarLayoutContext.Provider value={topBar}>
					<CardHeader session={busy} loading={loading} onDismiss={() => {}} />
				</TopBarLayoutContext.Provider>
			</MemoryRouter>,
			{ wrapper: Stars },
		);
	}

	it("keeps the status wordless, leaving the name to the top bar", () => {
		renderHeader(true);

		expect(screen.queryByText("● running")).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
	});

	it("leaves context and counts to the body", () => {
		renderHeader(true);

		expect(screen.queryByText("42%")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});

	it("orders the row glyph, then title, then actions", () => {
		renderHeader(true);

		const glyph = screen.getByTitle("running");
		const title = screen.getByText("my session");
		const dismiss = screen.getByTitle("Dismiss session 1");
		const follows = (from: Node, to: Node) =>
			Boolean(
				from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING,
			);

		expect(follows(glyph, title)).toBe(true);
		expect(follows(title, dismiss)).toBe(true);
	});

	it("holds the status back while the card is still starting", () => {
		renderHeader(true, true);

		expect(screen.getByRole("progressbar")).toBeTruthy();
		expect(screen.queryByTitle("running")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
