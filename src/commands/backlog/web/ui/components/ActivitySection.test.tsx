// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import type { Conversation, GitRef } from "../types";
import { ActivitySection } from "./ActivitySection";

afterEach(cleanup);

const commitCreatedAt = "2026-07-08T09:34:00.000Z";

const formattedTimestamp = new Date(commitCreatedAt).toLocaleDateString(
	undefined,
	{
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	},
);

function manyCommits(): GitRef[] {
	return Array.from({ length: 13 }, (_, i) => ({
		kind: "commit",
		ref: `commit${i}`,
		url: `https://gh/commit/commit${i}`,
		createdAt: commitCreatedAt,
	}));
}

describe("ActivitySection", () => {
	it("renders nothing when there are no refs", () => {
		const { container } = render(<ActivitySection gitRefs={[]} />);

		expect(container.firstChild).toBeNull();
	});

	it("renders branch, commit, and PR with clickable links", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature", url: "https://gh/tree/feature" },
			{
				kind: "commit",
				ref: "abcdef1234",
				title: "Do it",
				url: "https://gh/commit/abcdef1234",
			},
			{
				kind: "pr",
				ref: "42",
				title: "My PR",
				state: "OPEN",
				url: "https://gh/pull/42",
			},
		];

		render(<ActivitySection gitRefs={refs} />);

		expect(screen.getByText("Activity")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "feature" }).getAttribute("href"),
		).toBe("https://gh/tree/feature");
		expect(screen.getByRole("link", { name: "abcdef12 Do it" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "#42 My PR (open)" })).toBeTruthy();
	});

	it("renders gracefully without a link when the branch or PR is gone", () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "deleted-branch" },
			{ kind: "pr", ref: "9" },
		];

		render(<ActivitySection gitRefs={refs} />);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByText("deleted-branch")).toBeTruthy();
		expect(screen.getByText("#9")).toBeTruthy();
	});

	it("renders a conversation labelled by its title, or its bare id", () => {
		const conversations: Conversation[] = [
			{ sessionId: "titled-session", title: "Fix the thing" },
			{ sessionId: "untitled-session" },
		];

		render(<ActivitySection gitRefs={[]} conversations={conversations} />);

		expect(screen.getAllByText("session")).toHaveLength(2);
		expect(screen.getByText("Fix the thing")).toBeTruthy();
		expect(screen.getByText("untitled-session")).toBeTruthy();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("ignores session git-refs, which arrive as conversations instead", () => {
		const refs: GitRef[] = [
			{ kind: "session", ref: "titled-session", title: "Fix the thing" },
		];

		const { container } = render(<ActivitySection gitRefs={refs} />);

		expect(container.firstChild).toBeNull();
	});

	it("resumes a conversation with its cwd and harness", () => {
		const resumeSession = vi.fn();
		const conversations: Conversation[] = [
			{
				sessionId: "codex-session",
				title: "Fix the thing",
				cwd: "/home/dev/repo",
				harness: "codex",
			},
		];

		render(
			<SessionLaunchContext.Provider
				value={{
					launchAssist: () => {},
					launchAgentInStream: () => {},
					resumeSession,
					armUpdateReload: () => {},
				}}
			>
				<ActivitySection gitRefs={[]} conversations={conversations} />
			</SessionLaunchContext.Provider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Resume" }));

		expect(resumeSession).toHaveBeenCalledWith(
			"codex-session",
			"/home/dev/repo",
			"Fix the thing",
			"codex",
		);
	});

	it("shows a timestamp on commits but not on branches or PRs", () => {
		const createdAt = "2026-07-08T09:34:00.000Z";
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature", createdAt },
			{ kind: "commit", ref: "abcdef1234", createdAt },
		];

		render(<ActivitySection gitRefs={refs} />);

		const expected = new Date(createdAt).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
		expect(screen.getAllByText(expected)).toHaveLength(1);
	});

	it("orders refs newest-first and caps commits with an overflow indicator", () => {
		render(<ActivitySection gitRefs={manyCommits()} />);

		expect(screen.getAllByText(/^commit\d+$/)).toHaveLength(10);
		expect(screen.getByText("commit12")).toBeTruthy();
		expect(screen.queryByText("commit0")).toBeNull();
		expect(
			screen.getByRole("button", { name: "… and 3 more commits" }),
		).toBeTruthy();
	});

	it("expands the hidden commits when the overflow control is clicked", () => {
		render(<ActivitySection gitRefs={manyCommits()} />);

		fireEvent.click(
			screen.getByRole("button", { name: "… and 3 more commits" }),
		);

		expect(screen.getAllByText(/^commit\d+$/)).toHaveLength(13);
		expect(
			screen.getByRole("link", { name: "commit0" }).getAttribute("href"),
		).toBe("https://gh/commit/commit0");
		expect(screen.getAllByText("commit")).toHaveLength(13);
		expect(screen.getAllByText(formattedTimestamp)).toHaveLength(13);
		expect(screen.queryByText("… and 3 more commits")).toBeNull();
	});

	it("collapses back to the capped list", () => {
		render(<ActivitySection gitRefs={manyCommits()} />);

		fireEvent.click(
			screen.getByRole("button", { name: "… and 3 more commits" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Show fewer commits" }));

		expect(screen.getAllByText(/^commit\d+$/)).toHaveLength(10);
		expect(screen.queryByText("commit0")).toBeNull();
		expect(
			screen.getByRole("button", { name: "… and 3 more commits" }),
		).toBeTruthy();
	});

	it("shows no overflow control when the commits fit under the cap", () => {
		const commits: GitRef[] = Array.from({ length: 10 }, (_, i) => ({
			kind: "commit",
			ref: `commit${i}`,
		}));

		render(<ActivitySection gitRefs={commits} />);

		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.queryByText(/more commits/)).toBeNull();
	});
});
