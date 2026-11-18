// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { CardBoard } from "./CardBoard";
import type { SessionSocket } from "../useSessionSocket";

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

afterEach(cleanup);

const question = {
	requestId: "req-1",
	title: "Pick a colour",
	body: "",
	prNumber: null,
	kind: "question" as const,
};

function renderBoard() {
	const socket = {
		sessions: [
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
		sendPrDecision: vi.fn(),
		sendInput: vi.fn(),
	} as unknown as SessionSocket;
	render(
		<MemoryRouter>
			<CardBoard socket={socket} />
		</MemoryRouter>,
	);
	return socket;
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

	it("returns to the full board when the pane closes", () => {
		renderBoard();
		fireEvent.click(screen.getByTestId("working-card"));

		fireEvent.click(screen.getByTitle("Close"));

		expect(screen.queryByTestId("card-session-pane")).toBeNull();
	});
});
