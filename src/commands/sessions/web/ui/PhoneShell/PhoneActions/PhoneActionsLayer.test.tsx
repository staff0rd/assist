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

function renderLayer(sessions: SessionInfo[]) {
	const socket = {
		sessions,
		nodes: { local: "mac", links: [] },
		dismissSession: vi.fn(),
		setStarred: vi.fn(),
		retrySession: vi.fn(),
		restartSession: vi.fn(),
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
	it("confirms End inside the sheet before dismissing a live session", () => {
		const socket = renderLayer([running]);

		fireEvent.click(screen.getByRole("button", { name: /End/ }));
		expect(socket.dismissSession).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "End session" }));
		expect(socket.dismissSession).toHaveBeenCalledWith("s1");
	});

	it("dismisses a done row from the swipe without confirming", () => {
		const socket = renderLayer([{ ...running, status: "done" }]);

		fireEvent.click(screen.getByRole("button", { name: /Done/ }));
		fireEvent.click(screen.getByRole("button", { name: /Dismiss/ }));
		expect(socket.dismissSession).toHaveBeenCalledWith("s1");
	});
});
