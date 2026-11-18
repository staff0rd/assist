// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { StarredSessionsProvider } from "../useStarredSessions";
import { CardPaneHeader } from "./CardPaneHeader";

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

const noop = () => {};

function renderHeader(session: SessionInfo, sessionShown: boolean) {
	const socket = {
		sessions: [session],
		retrySession: noop,
		restartSession: noop,
		startOverSession: noop,
		dismissSession: noop,
		setAutoApprove: noop,
		setAutoAdvance: noop,
	} as unknown as SessionSocket;
	render(
		<MemoryRouter>
			<ThemeProvider theme={createDesignTheme("dark")}>
				<StarredSessionsProvider sessions={[]} setSessionStarred={noop}>
					<CardPaneHeader
						session={session}
						socket={socket}
						sessionShown={sessionShown}
						onToggleSession={noop}
						onClose={noop}
					/>
				</StarredSessionsProvider>
			</ThemeProvider>
		</MemoryRouter>,
	);
}

const session = makeSessionInfo({
	id: "s1",
	status: "waiting",
	title: "Card title",
});

const dismissTitle = "Dismiss session s1 (Shift skips confirmation)";

describe("CardPaneHeader", () => {
	it.each([
		["open", true, "Hide session"],
		["collapsed", false, "Show session"],
	])(
		"shows the session controls and no title with the drawer %s",
		(_, shown, toggleLabel) => {
			renderHeader(session, shown);

			expect(screen.queryByText("Card title")).toBeNull();
			expect(screen.getByTitle(dismissTitle)).toBeTruthy();
			expect(screen.getByRole("button", { name: toggleLabel })).toBeTruthy();
		},
	);

	it("hides the controls while a transfer is pending", () => {
		renderHeader(
			{ ...session, transfer: { target: "box", stage: "snapshotting" } },
			false,
		);

		expect(screen.queryByTitle(dismissTitle)).toBeNull();
		expect(screen.getByRole("button", { name: "Show session" })).toBeTruthy();
	});
});
