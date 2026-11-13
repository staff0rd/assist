// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StarredSessionsProvider } from "../../App/useStarredSessions";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneSessionList } from "../PhoneSessionList";
import { PhoneActionsLayer } from "./PhoneActionsLayer";
import { usePhoneActions } from "./usePhoneActions";

vi.mock("../../App/useStarredSessions/loadStarredKeys", () => ({
	backlogCwds: () => [],
	loadStarredKeys: async () => new Set<string>(),
}));

afterEach(cleanup);

const running: SessionInfo = {
	id: "s1",
	name: "s1",
	title: "Live session",
	status: "running",
	commandType: "claude",
	startedAt: 0,
};

function OpenActions({ session }: { session: SessionInfo }) {
	const { openSheet } = usePhoneActions();
	return (
		<button type="button" onClick={() => openSheet(session)}>
			Open actions
		</button>
	);
}

function renderLayer(sessions: SessionInfo[]) {
	const socket = {
		sessions,
		nodes: { local: "mac", links: [] },
		dismissSession: vi.fn(),
		setStarred: vi.fn(),
		retrySession: vi.fn(),
		restartSession: vi.fn(),
		startOverSession: vi.fn(),
		setAutoApprove: vi.fn(),
		setAutoAdvance: vi.fn(),
		createAssistSession: vi.fn(),
	} as unknown as SessionSocket;
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter>
				<StarredSessionsProvider
					sessions={sessions}
					setSessionStarred={socket.setStarred}
				>
					<PhoneActionsLayer socket={socket}>
						<OpenActions session={sessions[0]!} />
						<PhoneSessionList
							sessions={sessions}
							localNode="mac"
							reconnecting={false}
							onRefresh={() => {}}
						/>
					</PhoneActionsLayer>
				</StarredSessionsProvider>
			</MemoryRouter>
		</ThemeProvider>,
	);
	return socket;
}

describe("PhoneActionsLayer", () => {
	it.each(["claude", "assist"] as const)(
		"confirms Start over for %s sessions",
		(commandType) => {
			const socket = renderLayer([
				{ ...running, commandType, harness: "claude" },
			]);
			fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
			expect(
				screen.getByRole("button", { name: "Restart session" }),
			).toBeTruthy();
			fireEvent.click(
				screen.getByRole("button", { name: "Start over session" }),
			);
			expect(
				screen.getByText(/The conversation history is discarded/),
			).toBeTruthy();
			expect(socket.startOverSession).not.toHaveBeenCalled();
			fireEvent.click(
				screen.getByRole("button", { name: "Start over session" }),
			);
			expect(socket.startOverSession).toHaveBeenCalledExactlyOnceWith("s1");
			expect(socket.restartSession).not.toHaveBeenCalled();
			expect(socket.dismissSession).not.toHaveBeenCalled();
		},
	);

	it("cancels Start over without starting a new conversation", () => {
		const socket = renderLayer([running]);
		fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
		fireEvent.click(screen.getByRole("button", { name: "Start over session" }));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(socket.startOverSession).not.toHaveBeenCalled();
	});

	it.each([
		{ ...running, status: "stopped" as const },
		{ ...running, commandType: "run" as const },
	])("hides Start over for $commandType/$status", (session) => {
		renderLayer([session]);
		fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
		expect(
			screen.queryByRole("button", { name: "Start over session" }),
		).toBeNull();
	});

	it("confirms End inside the sheet before dismissing a live session", () => {
		const socket = renderLayer([running]);

		fireEvent.click(screen.getByRole("button", { name: /End/ }));
		expect(socket.dismissSession).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "End session" }));
		expect(socket.dismissSession).toHaveBeenCalledWith("s1", undefined);
	});

	it("dismisses a done row from the swipe without confirming", () => {
		const socket = renderLayer([{ ...running, status: "done" }]);

		fireEvent.click(screen.getByRole("button", { name: /Done/ }));
		fireEvent.click(screen.getByRole("button", { name: /Dismiss/ }));
		expect(socket.dismissSession).toHaveBeenCalledWith("s1", undefined);
	});
});
