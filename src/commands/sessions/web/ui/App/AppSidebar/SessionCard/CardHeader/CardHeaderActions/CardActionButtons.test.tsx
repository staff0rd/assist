// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../test/mothers/makeSessionInfo";
import { CardActionButtons } from "./CardActionButtons";
import { StarredSessionsProvider } from "../../../../useStarredSessions";

afterEach(cleanup);

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

describe("CardActionButtons dismiss visibility", () => {
	it("offers the plain dismiss on an ordinary waiting card", () => {
		render(
			<CardActionButtons
				session={makeSessionInfo({ id: "3", status: "waiting" })}
				loading={false}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(
			screen.queryByTitle("Dismiss session 3 (Shift skips confirmation)"),
		).not.toBeNull();
	});

	it("withholds the plain dismiss while a card is stopped", () => {
		render(
			<CardActionButtons
				session={makeSessionInfo({ id: "3", status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(
			screen.queryByTitle("Dismiss session 3 (Shift skips confirmation)"),
		).toBeNull();
		expect(
			screen.queryByTitle("Restart session 3 (Shift skips confirmation)"),
		).not.toBeNull();
	});

	it("offers discard only when a stopped card holds undurable work", () => {
		const { rerender } = render(
			<CardActionButtons
				session={makeSessionInfo({ id: "3", status: "stopped" })}
				loading={false}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);
		expect(
			screen.queryByTitle(
				"Discard changes and remove worktree (Shift skips confirmation)",
			),
		).toBeNull();

		rerender(
			<Stars>
				<CardActionButtons
					session={makeSessionInfo({
						id: "3",
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
			screen.queryByTitle(
				"Discard changes and remove worktree (Shift skips confirmation)",
			),
		).not.toBeNull();
	});

	it("confirms a worktree discard by naming the tree and what it holds", () => {
		render(
			<CardActionButtons
				session={makeSessionInfo({
					id: "3",
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

		fireEvent.click(
			screen.getByTitle(
				"Discard changes and remove worktree (Shift skips confirmation)",
			),
		);

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
				session={makeSessionInfo({
					id: "3",
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
			screen.getByTitle(
				"Drop this card and stop tracking its unlanded work (Shift skips confirmation)",
			),
		);

		expect(screen.queryByText("Stop tracking this work")).not.toBeNull();
		expect(
			screen.queryByText(
				"This drops the card and stops tracking the unlanded work in /git/assist (uncommitted changes). Nothing on disk is deleted.",
			),
		).not.toBeNull();
	});
});

describe("CardActionButtons beside the top bar", () => {
	it("leaves the session actions to the top bar", () => {
		render(
			<CardActionButtons
				session={makeSessionInfo({
					id: "3",
					status: "waiting",
					commandType: "run",
				})}
				loading={false}
				onRetry={() => {}}
				onRestart={() => {}}
				onDismiss={() => {}}
			/>,
			{ wrapper: Stars },
		);

		expect(
			screen.queryByTitle("Restart session 3 (Shift skips confirmation)"),
		).toBeNull();
		expect(screen.queryByTitle("Retry session 3")).toBeNull();
		expect(screen.queryByLabelText("Star")).toBeNull();
	});
});
