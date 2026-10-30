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
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { CardBody } from "./CardBody";
import type { SessionInfo } from "../../../types";
import { DiffPanelsProvider } from "../../useDiffPanels";

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

const draft = makeSessionInfo({
	id: "5",
	name: "assist draft --once something",
	commandType: "assist",
	status: "running",
	runningMs: 0,
	runningSince: null,
	cwd: "/git/repo-2",
});

function renderBody(
	s: SessionInfo,
	loading: boolean,
	onActivateSession: (id: string) => void = vi.fn(),
) {
	return render(
		<MemoryRouter>
			<DiffPanelsProvider sessionIds={[]} onActivateSession={onActivateSession}>
				<CardBody session={s} loading={loading} />
			</DiffPanelsProvider>
		</MemoryRouter>,
	);
}

describe("CardBody while busy", () => {
	it("leaves no bottom row for a session that is booting", () => {
		const { container } = renderBody(draft, true);

		expect(container.innerHTML).toBe("");
		expect(screen.queryByRole("progressbar")).toBeNull();
		expect(screen.queryByText("Starting…")).toBeNull();
	});

	it("leaves no bottom row while the worktree is being torn down", () => {
		const { container } = renderBody(
			makeSessionInfo({ ...draft, closing: true }),
			true,
		);

		expect(container.innerHTML).toBe("");
		expect(screen.queryByText("Closing…")).toBeNull();
	});
});

describe("CardBody meta line", () => {
	it("names the repo as plain text once the activity resolves", () => {
		renderBody(
			makeSessionInfo({
				...draft,
				activity: { kind: "command", startedAt: 0 },
			}),
			false,
		);

		const repo = screen.getByText("repo-2");
		expect(repo.closest(".MuiChip-root")).toBeNull();
	});

	it("holds the meta line back while the activity is still unknown", () => {
		renderBody(draft, false);

		expect(screen.queryByText("repo-2")).toBeNull();
	});

	it("leaves the phase caption to the top bar", () => {
		renderBody(
			makeSessionInfo({
				...draft,
				activity: { kind: "backlog", startedAt: 0, phaseName: "Phase 1: flag" },
			}),
			false,
		);

		expect(screen.queryByText("Phase 1: flag")).toBeNull();
	});
});

describe("CardBody git status counts", () => {
	it("shows the card's own working-tree counts", async () => {
		renderBody(draft, false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.getByText("~2")).toBeTruthy();
		expect(screen.queryByText("-0")).toBeNull();
	});

	it("activates the card's session when its counts are clicked", async () => {
		const onActivateSession = vi.fn();
		renderBody(draft, false, onActivateSession);

		fireEvent.click(await screen.findByText("+1"));

		expect(onActivateSession).toHaveBeenCalledWith("5");
	});

	it("carries the claude session id into the counts request", async () => {
		renderBody(makeSessionInfo({ ...draft, claudeSessionId: "sess-1" }), false);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(fetch).toHaveBeenCalledWith(
			"/api/git-status?cwd=%2Fgit%2Frepo-2&session=sess-1",
			undefined,
		);
	});

	it("shows no counts while the card is starting or closing", async () => {
		const { container } = renderBody(
			makeSessionInfo({ ...draft, closing: true }),
			true,
		);

		await waitFor(() => expect(container.innerHTML).toBe(""));
		expect(screen.queryByText("+1")).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("CardBody review button", () => {
	it("leaves the review button to the session action row", async () => {
		renderBody(
			makeSessionInfo({ ...draft, assistArgs: ["review-pr-comments", "12"] }),
			false,
		);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.queryByText("Findings")).toBeNull();
	});
});

describe("CardBody top bar layout", () => {
	it("keeps only the diff counts, leaving the rest to the top bar", async () => {
		renderBody(
			makeSessionInfo({ ...draft, runningMs: 65_000, restored: true }),
			false,
		);

		expect(await screen.findByText("+1")).toBeTruthy();
		expect(screen.queryByText("1m 5s")).toBeNull();
		expect(screen.queryByText("restored")).toBeNull();
		expect(screen.queryByText("● running")).toBeNull();
	});
});
