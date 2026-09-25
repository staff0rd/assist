// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionListCard } from "./SessionListCard";
import type { SessionInfo } from "../../../../../../../../../../types";
import { StarredSessionsProvider } from "../../../../../../../useStarredSessions";

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

const assistSession: SessionInfo = {
	id: "1",
	name: "repo/assist draft",
	commandType: "assist",
	status: "done",
	startedAt: 0,
	assistArgs: ["draft"],
};

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
		renderListCard({
			id: "1",
			name: "repo/run: build",
			commandType: "run",
			status: "done",
			startedAt: 0,
			runName: "build",
		});
		expect(screen.getByTitle("Retry session 1")).toBeTruthy();
	});
});
