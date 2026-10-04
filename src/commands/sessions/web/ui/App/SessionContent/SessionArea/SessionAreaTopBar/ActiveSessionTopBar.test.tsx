// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveSessionTopBar } from "./ActiveSessionTopBar";
import type { SessionInfo } from "../../../../types";
import { StarredSessionsProvider } from "../../../useStarredSessions";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";

class TestResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

beforeEach(() => {
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
	cleanup();
	Reflect.deleteProperty(globalThis, "ResizeObserver");
});

const group = { origin: "host/org/assist", clone: "/git/assist" };

const parent = makeSessionInfo({
	id: "run",
	status: "done",
	cwd: "/git/assist-2",
	repoGroup: group,
	activity: { kind: "backlog", startedAt: 0 },
});
const child = makeSessionInfo({
	id: "review",
	status: "waiting",
	cwd: "/git/assist-2",
	repoGroup: group,
});
const unrelated = makeSessionInfo({ id: "other", cwd: "/git/elsewhere" });

function renderTopBar(session: SessionInfo, onDismiss: (id: string) => void) {
	render(
		<MemoryRouter>
			<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
				<ActiveSessionTopBar
					session={session}
					sessions={[parent, child, unrelated]}
					lifecycle={{
						onRetry: () => {},
						onRestart: () => {},
						onDismiss,
						onSetAutoRun: () => {},
						onSetAutoAdvance: () => {},
					}}
				/>
			</StarredSessionsProvider>
		</MemoryRouter>,
	);
}

describe("ActiveSessionTopBar nested dismiss", () => {
	it("dismisses the parent and its nested session on Close all", () => {
		const onDismiss = vi.fn();
		renderTopBar(parent, onDismiss);

		fireEvent.click(screen.getByTitle("Dismiss session run"));
		fireEvent.click(screen.getByRole("button", { name: "Close all 2" }));

		expect(onDismiss.mock.calls).toEqual([["run"], ["review"]]);
	});

	it("dismisses only the parent on Close this only", () => {
		const onDismiss = vi.fn();
		renderTopBar(parent, onDismiss);

		fireEvent.click(screen.getByTitle("Dismiss session run"));
		fireEvent.click(screen.getByRole("button", { name: "Close this only" }));

		expect(onDismiss.mock.calls).toEqual([["run"]]);
	});

	it("dismisses a done session without children straight away", () => {
		const onDismiss = vi.fn();
		renderTopBar({ ...unrelated, status: "done" }, onDismiss);

		fireEvent.click(screen.getByTitle("Dismiss session other"));

		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onDismiss.mock.calls).toEqual([["other"]]);
	});
});
