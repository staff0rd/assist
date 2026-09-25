// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CardActionButtons } from "./CardActionButtons";
import type { SessionInfo } from "../../../../../types";
import { StarredSessionsProvider } from "../../../../useStarredSessions";
import { TopBarLayoutContext } from "../../../../useTopBarLayoutContext";

afterEach(cleanup);

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "3",
		name: "worktree session",
		commandType: "claude",
		status: "waiting",
		startedAt: 0,
		...overrides,
	};
}

describe("CardActionButtons dismiss visibility", () => {
	it("offers the plain dismiss on an ordinary waiting card", () => {
		render(
			<CardActionButtons
				session={session({ status: "waiting" })}
				loading={false}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(screen.queryByTitle("Dismiss session 3")).not.toBeNull();
	});

	it("withholds the plain dismiss while a card is stopped", () => {
		render(
			<CardActionButtons
				session={session({ status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(screen.queryByTitle("Dismiss session 3")).toBeNull();
		expect(screen.queryByTitle("Restart session 3")).not.toBeNull();
	});

	it("offers discard only when a stopped card holds undurable work", () => {
		const { rerender } = render(
			<CardActionButtons
				session={session({ status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
		expect(
			screen.queryByTitle("Discard changes and remove worktree"),
		).toBeNull();

		rerender(
			<Stars>
				<CardActionButtons
					session={session({
						status: "stopped",
						undurable: { reason: "uncommitted changes", removesTree: true },
					})}
					loading={false}
					onRestart={() => {}}
					onDismiss={() => {}}
				/>
			</Stars>,
		);
		expect(
			screen.queryByTitle("Discard changes and remove worktree"),
		).not.toBeNull();
	});

	it("confirms a worktree discard by naming the tree and what it holds", () => {
		render(
			<CardActionButtons
				session={session({
					status: "stopped",
					cwd: "/git/assist-2",
					undurable: { reason: "unpushed commits", removesTree: true },
				})}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		fireEvent.click(screen.getByTitle("Discard changes and remove worktree"));

		expect(screen.queryByText("Discard all changes")).not.toBeNull();
		expect(
			screen.queryByText(
				"This permanently deletes the worktree /git/assist-2 and the work it holds (unpushed commits). This cannot be undone.",
			),
		).not.toBeNull();
	});

	it("promises to delete nothing when discarding a card held in the clone's own tree", () => {
		render(
			<CardActionButtons
				session={session({
					status: "stopped",
					cwd: "/git/assist",
					undurable: { reason: "uncommitted changes" },
				})}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		fireEvent.click(
			screen.getByTitle("Drop this card and stop tracking its unlanded work"),
		);

		expect(screen.queryByText("Stop tracking this work")).not.toBeNull();
		expect(
			screen.queryByText(
				"This drops the card and stops tracking the unlanded work in /git/assist (uncommitted changes). Nothing on disk is deleted.",
			),
		).not.toBeNull();
	});
});

describe("CardActionButtons under the top bar layout", () => {
	function renderButtons(topBar: boolean, session: SessionInfo) {
		render(
			<TopBarLayoutContext.Provider value={topBar}>
				<CardActionButtons
					session={session}
					loading={false}
					onRetry={() => {}}
					onRestart={() => {}}
					onDismiss={() => {}}
				/>
			</TopBarLayoutContext.Provider>,
			{ wrapper: Stars },
		);
	}

	it("drops the moving actions from the card when the flag is on", () => {
		renderButtons(true, session({ status: "waiting", commandType: "run" }));

		expect(screen.queryByTitle("Restart session 3")).toBeNull();
		expect(screen.queryByTitle("Retry session 3")).toBeNull();
		expect(screen.queryByLabelText("Star")).toBeNull();
	});

	it("keeps dismiss on the card when the flag is on", () => {
		renderButtons(true, session({ status: "waiting" }));

		expect(screen.queryByTitle("Dismiss session 3")).not.toBeNull();
	});

	it("keeps restart on a stopped card when the flag is on", () => {
		renderButtons(true, session({ status: "stopped" }));

		expect(screen.queryByTitle("Restart session 3")).not.toBeNull();
	});

	it("keeps the moving actions on the card when the flag is off", () => {
		renderButtons(false, session({ status: "waiting", commandType: "run" }));

		expect(screen.queryByTitle("Retry session 3")).not.toBeNull();
	});
});
