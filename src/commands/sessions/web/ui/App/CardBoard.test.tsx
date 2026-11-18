// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { CardBoard } from "./CardBoard";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { ServerActionsContext } from "./useServerActionsContext";

vi.mock("./SessionContent/SessionArea/TerminalArea", () => ({
	TerminalArea: ({ activeId }: { activeId: string }) => (
		<div data-testid="server-log">{`log: ${activeId}`}</div>
	),
}));

vi.mock("./SessionContent/PrPreviewSlideInPane", () => ({
	PrPreviewSlideInPane: ({
		preview,
		onDecision,
	}: {
		preview: { title: string };
		onDecision: (decision: string, details: object) => void;
	}) => (
		<button type="button" onClick={() => onDecision("approve", {})}>
			{`preview: ${preview.title}`}
		</button>
	),
}));

vi.mock("./CardBoard/CardSessionView", () => ({
	CardSessionView: ({ session }: { session: { id: string } }) => (
		<section data-testid="card-session-view">{`session: ${session.id}`}</section>
	),
}));

afterEach(cleanup);

const question = {
	requestId: "req-1",
	title: "Pick a colour",
	body: "",
	prNumber: null,
	kind: "question" as const,
};

function renderBoard(extra: SessionInfo[] = []) {
	const socket = {
		sessions: [
			...extra,
			makeSessionInfo({
				id: "w",
				status: "waiting",
				title: "Needs input",
				pendingPrPreview: question,
			}),
			makeSessionInfo({
				id: "r",
				status: "running",
				title: "Busy",
				lastAssistantMessage: "Refactoring the parser",
			}),
		],
		selectSession: vi.fn(),
		dismissSession: vi.fn(),
		initialized: new Set(),
		sendPrDecision: vi.fn(),
		sendInput: vi.fn(),
	} as unknown as SessionSocket;
	const serverActions = {
		onStop: vi.fn(),
		onStart: vi.fn(),
		onDiscard: vi.fn(),
	};
	render(
		<MemoryRouter>
			<ServerActionsContext.Provider value={serverActions}>
				<CardBoard socket={socket} />
			</ServerActionsContext.Provider>
		</MemoryRouter>,
	);
	return Object.assign(socket, { serverActions });
}

describe("CardBoard", () => {
	it("opens a card with a pending preview and sends its decision", () => {
		const socket = renderBoard();

		fireEvent.click(screen.getByTestId("needs-you-card"));
		fireEvent.click(screen.getByText("preview: Pick a colour"));

		expect(socket.selectSession).toHaveBeenCalledWith("w");
		expect(socket.sendPrDecision).toHaveBeenCalledWith(
			"w",
			"req-1",
			"approve",
			{},
		);
		expect(screen.queryByTestId("card-last-message")).toBeNull();
	});

	it("shows the last message and sends a reply when nothing is pending", () => {
		const socket = renderBoard();
		fireEvent.click(screen.getByTestId("working-card"));

		const pane = screen.getByTestId("card-last-message");
		expect(pane.textContent).toContain("Refactoring the parser");
		fireEvent.change(screen.getByLabelText("Reply"), {
			target: { value: "carry on" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Send" }));

		expect(socket.sendInput).toHaveBeenCalledWith(
			"r",
			expect.stringContaining("carry on"),
		);
	});

	it("dismisses a session from its card without opening it", () => {
		const socket = renderBoard();

		fireEvent.click(screen.getByTitle(/Dismiss session r/), { shiftKey: true });

		expect(socket.dismissSession).toHaveBeenCalledWith("r", undefined);
		expect(socket.selectSession).not.toHaveBeenCalled();
		expect(screen.queryByTestId("card-session-pane")).toBeNull();
	});

	it("returns to the full board when the pane closes", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("working-card"));

		fireEvent.click(screen.getByTitle("Close"));

		expect(screen.queryByTestId("card-session-pane")).toBeNull();
	});

	it("keeps finished sessions in a collapsed Other group that opens like a card", () => {
		const socket = renderBoard([
			makeSessionInfo({ id: "d", status: "done", title: "Shipped" }),
		]);
		expect(screen.queryByTestId("other-card")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: /Other \(1\)/ }));
		fireEvent.click(screen.getByTestId("other-card"));

		expect(socket.selectSession).toHaveBeenCalledWith("d");
		expect(screen.getByTestId("card-session-pane")).toBeTruthy();
	});

	it("shows running servers as pills that stop and open their log", () => {
		const socket = renderBoard([
			makeSessionInfo({
				id: "srv",
				status: "running",
				commandType: "run",
				server: true,
				runName: "dev",
				port: 5173,
			}),
		]);
		const pill = screen.getByTestId("server-pill");
		expect(screen.getAllByTestId("working-card")).toHaveLength(1);
		expect(pill.textContent).toContain(":5173");

		fireEvent.click(screen.getByRole("button", { name: "Stop dev" }));
		expect(socket.serverActions.onStop).toHaveBeenCalledWith("srv");

		fireEvent.click(screen.getByText("dev"));
		expect(screen.getByTestId("server-log").textContent).toBe("log: srv");
	});

	it("offers restart on an exited server", () => {
		const socket = renderBoard([
			makeSessionInfo({
				id: "srv",
				status: "done",
				commandType: "run",
				runName: "dev",
				cwd: "/repo",
			}),
		]);

		fireEvent.click(screen.getByRole("button", { name: "Restart dev" }));

		expect(socket.serverActions.onStart).toHaveBeenCalledWith(
			"dev",
			"/repo",
			undefined,
			undefined,
			undefined,
		);
	});

	it("toggles the session view above the preview", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("needs-you-card"));
		expect(screen.queryByTestId("card-session-view")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Show session" }));

		expect(screen.getByTestId("card-session-view").textContent).toBe(
			"session: w",
		);
		expect(screen.getByText("preview: Pick a colour")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Hide session" }));

		expect(screen.queryByTestId("card-session-view")).toBeNull();
	});

	it("hides the session again when another card opens", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("needs-you-card"));
		fireEvent.click(screen.getByRole("button", { name: "Show session" }));

		fireEvent.click(screen.getByTestId("working-card"));

		expect(screen.queryByTestId("card-session-view")).toBeNull();
		expect(screen.getByRole("button", { name: "Show session" })).toBeTruthy();
	});

	it("hides the session again after the pane closes and reopens", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("working-card"));
		fireEvent.click(screen.getByRole("button", { name: "Show session" }));

		fireEvent.click(screen.getByTitle("Close"));
		fireEvent.click(screen.getByTestId("working-card"));

		expect(screen.queryByTestId("card-session-view")).toBeNull();
	});
});
