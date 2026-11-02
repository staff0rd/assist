// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionListCard } from "./SessionListCard";
import { StarredSessionsProvider } from "../../../../../../useStarredSessions";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";
import { renderWithTheme as render } from "../../../../../../../../../../../test/renderWithTheme";

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
				onSetAutoApprove={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);

		fireEvent.click(
			screen.getByTitle("Dismiss session 1 (Shift skips confirmation)"),
		);
		fireEvent.click(screen.getByRole("button", { name: "Close all 3" }));

		expect(onDismiss.mock.calls).toEqual([["1"], ["2"], ["3"]]);
	});
});
