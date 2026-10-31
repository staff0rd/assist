// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HistoryList } from "./HistoryList";
import type { HistoricalSession } from "../../../../types";
import { HistorySearchQueryProvider } from "../../../useHistorySearchQuery";
import {
	type RepoSelection,
	RepoSelectionContext,
} from "../../../../useRepoSelectionContext";

vi.mock("../../../../clientFailures/queueClientFailureReport", () => ({
	queueClientFailureReport: vi.fn(),
}));

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const group = { origin: "host/org/assist", clone: "/git/assist" };

function session(
	name: string,
	cwd: string,
	repoGroup?: HistoricalSession["repoGroup"],
): HistoricalSession {
	return {
		sessionId: `sid-${name}`,
		name,
		project: cwd.split("/").pop() ?? cwd,
		cwd,
		timestamp: new Date(0).toISOString(),
		repoGroup,
	};
}

function renderList(
	sessions: HistoricalSession[],
	selectedCwd: string,
	viewingId: string | null = null,
	selection: Partial<RepoSelection> = {},
) {
	const onView = vi.fn();
	const rendered = render(
		<RepoSelectionContext.Provider
			value={{
				repos: [],
				selectedCwd,
				worktreeCwd: selectedCwd,
				setSelectedCwd: vi.fn(),
				cloneOn: (cwd) => cwd,
				originOf: () => undefined,
				...selection,
			}}
		>
			<HistorySearchQueryProvider>
				<HistoryList
					sessions={sessions}
					viewingId={viewingId}
					onView={onView}
					onResume={vi.fn()}
				/>
			</HistorySearchQueryProvider>
		</RepoSelectionContext.Provider>,
	);
	return { ...rendered, onView };
}

describe("HistoryList", () => {
	it("lists a clone's worktree sessions under the clone entry", () => {
		renderList(
			[
				session("in clone", "/git/assist", group),
				session("in worktree", "/git/assist-2", group),
			],
			"/git/assist",
		);

		expect(screen.getByText("in clone")).toBeTruthy();
		expect(screen.getByText("in worktree")).toBeTruthy();
	});

	it("excludes sessions from another repo sharing a directory name", () => {
		renderList(
			[
				session("mine", "/git/assist", group),
				session("theirs", "/other/assist", {
					origin: "host/org/other",
					clone: "/other/assist",
				}),
			],
			"/git/assist",
		);

		expect(screen.getByText("mine")).toBeTruthy();
		expect(screen.queryByText("theirs")).toBeNull();
	});

	it("keeps a stale-origin session under the clone it shares", () => {
		renderList(
			[
				session("live", "/git/apm", {
					origin: "host/org/apm",
					clone: "/git/apm",
				}),
				session("reaped", "/git/apm-2", {
					origin: "local:/git/apm",
					clone: "/git/apm",
				}),
			],
			"/git/apm",
		);

		expect(screen.getByText("live")).toBeTruthy();
		expect(screen.getByText("reaped")).toBeTruthy();
	});

	it("falls back to the cwd for sessions with no resolved group", () => {
		renderList(
			[session("ungrouped", "/git/plain"), session("elsewhere", "/git/other")],
			"/git/plain",
		);

		expect(screen.getByText("ungrouped")).toBeTruthy();
		expect(screen.queryByText("elsewhere")).toBeNull();
	});

	it("marks only the viewed session's card as current", () => {
		const sessions = [
			session("first", "/git/assist", group),
			session("second", "/git/assist", group),
		];
		const current = () =>
			[...document.querySelectorAll("[aria-current]")].map(
				(el) => el.textContent,
			);

		const { unmount } = renderList(sessions, "/git/assist");
		expect(current()).toEqual([]);
		unmount();

		renderList(sessions, "/git/assist", "sid-second");
		expect(current()).toHaveLength(1);
		expect(current()[0]).toContain("second");
	});

	it("leaves Tab on a history row native", () => {
		renderList([session("first", "/git/assist", group)], "/git/assist");
		const row = screen.getByText("first").closest("button")!;
		row.focus();

		expect(fireEvent.keyDown(row, { key: "Tab" })).toBe(true);
		expect(document.activeElement).toBe(row);
	});
});

const listed = session("listed session", "/git/assist");

function hit(name: string, match = "needle"): HistoricalSession {
	return {
		...session(name, "/git/assist"),
		snippet: { before: "found the ", match, after: " here" },
	};
}

function respond(body: unknown, status = 200) {
	return { ok: status < 400, status, json: async () => body };
}

function renderSearchable(selection: Partial<RepoSelection> = {}) {
	return renderList([listed], "/git/assist", null, selection);
}

function searchCalls(fetch: ReturnType<typeof vi.fn>): string[] {
	return fetch.mock.calls
		.map(([url]) => String(url))
		.filter((url) => url.startsWith("/api/history/search"));
}

function search(query: string) {
	fireEvent.change(screen.getByPlaceholderText("Search history..."), {
		target: { value: query },
	});
}

describe("HistoryList search", () => {
	it("shows matching sessions with the highlighted snippet", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValue(respond({ sessions: [hit("hit")] }));
		vi.stubGlobal("fetch", fetch);
		renderSearchable();

		search("needle");

		expect(await screen.findByText("hit")).toBeTruthy();
		expect(screen.getByText("needle").tagName).toBe("MARK");
		expect(screen.queryByText("listed session")).toBeNull();
		expect(searchCalls(fetch)).toEqual([
			"/api/history/search?cwd=%2Fgit%2Fassist&q=needle",
		]);
	});

	it("debounces typing into one request", async () => {
		const fetch = vi.fn().mockResolvedValue(respond({ sessions: [] }));
		vi.stubGlobal("fetch", fetch);
		renderSearchable();

		search("n");
		search("ne");
		search("needle");

		await screen.findByText("No sessions match");
		expect(searchCalls(fetch)).toHaveLength(1);
	});

	it("shows a loading state while the search runs", () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => new Promise(() => {})),
		);
		renderSearchable();

		search("needle");

		expect(screen.getByText("Searching…")).toBeTruthy();
	});

	it("shows the error of a failed search", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(respond({ error: "daemon gone" }, 504)),
		);
		renderSearchable();

		search("needle");

		expect(await screen.findByText("Search failed: daemon gone")).toBeTruthy();
	});

	it("restores the normal list when the search is cleared", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(respond({ sessions: [hit("hit")] })),
		);
		renderSearchable();
		search("needle");
		await screen.findByText("hit");

		search("");

		expect(screen.getByText("listed session")).toBeTruthy();
		expect(screen.queryByText("hit")).toBeNull();
	});

	it("never lets a stale response replace a newer query's results", async () => {
		const pending: ((value: unknown) => void)[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(() => new Promise((resolve) => pending.push(resolve))),
		);
		renderSearchable();

		search("old");
		await waitFor(() => expect(pending).toHaveLength(1));
		search("new");
		await waitFor(() => expect(pending).toHaveLength(2));
		await act(async () => {
			pending[1](respond({ sessions: [hit("new result", "new")] }));
		});
		await act(async () => {
			pending[0](respond({ sessions: [hit("old result", "old")] }));
		});

		expect(screen.getByText("new result")).toBeTruthy();
		expect(screen.queryByText("old result")).toBeNull();
	});

	it("searches a linked node's repo on that node", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValue(respond({ sessions: [hit("remote")] }));
		vi.stubGlobal("fetch", fetch);
		const { onView } = renderSearchable({ selectedNode: "win" });

		search("needle");
		fireEvent.click(await screen.findByText("remote"));

		expect(searchCalls(fetch)).toEqual([
			"/api/history/search?cwd=%2Fgit%2Fassist&q=needle&node=win",
		]);
		expect(onView).toHaveBeenCalledWith(
			expect.objectContaining({ sessionId: "sid-remote", node: "win" }),
			"needle",
		);
	});

	it("passes the trimmed search term when opening a result", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(respond({ sessions: [hit("hit")] })),
		);
		const { onView } = renderSearchable();

		search("  needle ");
		fireEvent.click(await screen.findByText("hit"));

		expect(onView).toHaveBeenCalledWith(
			expect.objectContaining({ sessionId: "sid-hit" }),
			"needle",
		);
	});

	it("opens a card without a search term when no search is active", () => {
		const { onView } = renderSearchable();

		fireEvent.click(screen.getByText("listed session"));

		expect(onView).toHaveBeenCalledWith(
			expect.objectContaining({ sessionId: "sid-listed session" }),
		);
		expect(onView.mock.calls[0]).toHaveLength(1);
	});
});
