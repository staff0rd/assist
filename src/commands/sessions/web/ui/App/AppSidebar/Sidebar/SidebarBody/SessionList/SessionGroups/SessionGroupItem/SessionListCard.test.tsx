// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionListCard } from "./SessionListCard";
import type { SessionInfo } from "../../../../../../../types";
import { StarredSessionsProvider } from "../../../../../../useStarredSessions";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";

afterEach(() => {
	cleanup();
});

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function renderListCard(session: SessionInfo) {
	render(
		<SessionListCard
			session={session}
			activeId={null}
			initialized={new Set([session.id])}
			onSelect={() => {}}
			onRetry={() => {}}
			onRestart={() => {}}
			onDismiss={() => {}}
			onSetAutoRun={() => {}}
			onSetAutoAdvance={() => {}}
		/>,
		{ wrapper: Stars },
	);
}

const assistSession = makeSessionInfo({
	id: "1",
	name: "repo/assist draft",
	commandType: "assist",
	status: "done",
	assistArgs: ["draft"],
});

describe("SessionListCard nested dismiss", () => {
	it("dismisses the parent and every nested session on Close all", () => {
		const onDismiss = vi.fn();
		const parent = makeSessionInfo({ id: "1", status: "done" });
		render(
			<SessionListCard
				session={parent}
				nestedSessions={[
					makeSessionInfo({ id: "2", status: "waiting" }),
					makeSessionInfo({ id: "3", status: "done" }),
				]}
				activeId={null}
				initialized={new Set(["1"])}
				onSelect={() => {}}
				onRetry={() => {}}
				onRestart={() => {}}
				onDismiss={onDismiss}
				onSetAutoRun={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);

		fireEvent.click(screen.getByTitle("Dismiss session 1"));
		fireEvent.click(screen.getByRole("button", { name: "Close all 3" }));

		expect(onDismiss.mock.calls).toEqual([["1"], ["2"], ["3"]]);
	});
});

describe("SessionListCard retry affordance", () => {
	it("offers retry on an assist card that was not restored", () => {
		renderListCard({ ...assistSession, restored: false });
		expect(screen.getByTitle("Retry session 1")).toBeTruthy();
	});

	it("does not offer retry on an assist card that resumed its conversation", () => {
		renderListCard({ ...assistSession, status: "running", restored: true });
		expect(screen.queryByTitle("Retry session 1")).toBeNull();
	});

	it("does not offer retry on a not-restored assist card with no args to re-run", () => {
		renderListCard({
			...assistSession,
			assistArgs: undefined,
			restored: false,
		});
		expect(screen.queryByTitle("Retry session 1")).toBeNull();
	});

	it("still offers retry on a run card", () => {
		renderListCard(
			makeSessionInfo({
				id: "1",
				name: "repo/run: build",
				commandType: "run",
				status: "done",
				runName: "build",
			}),
		);
		expect(screen.getByTitle("Retry session 1")).toBeTruthy();
	});
});
