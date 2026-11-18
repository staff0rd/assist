// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { CardBoard } from "./CardBoard";
import type { SessionSocket } from "../useSessionSocket";

vi.mock("./SessionContent", () => ({
	SessionContent: () => <div data-testid="session-content" />,
}));

afterEach(cleanup);

function renderBoard(selectSession = vi.fn()) {
	const socket = {
		sessions: [
			makeSessionInfo({ id: "w", status: "waiting", title: "Needs input" }),
			makeSessionInfo({ id: "r", status: "running", title: "Busy" }),
		],
		selectSession,
	} as unknown as SessionSocket;
	render(
		<MemoryRouter>
			<CardBoard socket={socket} />
		</MemoryRouter>,
	);
	return selectSession;
}

describe("CardBoard", () => {
	it("opens the clicked card's session beside the board", () => {
		const selectSession = renderBoard();

		fireEvent.click(screen.getByTestId("needs-you-card"));

		expect(selectSession).toHaveBeenCalledWith("w");
		expect(screen.getByTestId("session-content")).toBeDefined();
	});

	it("returns to the full board when the pane closes", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("working-card"));

		fireEvent.click(screen.getByTitle("Close"));

		expect(screen.queryByTestId("card-session-pane")).toBeNull();
	});
});
