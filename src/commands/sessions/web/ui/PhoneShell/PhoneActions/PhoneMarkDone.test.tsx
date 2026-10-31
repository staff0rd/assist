// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateItemStatus } from "../../../../../backlog/web/ui/api";
import { StarredSessionsProvider } from "../../App/useStarredSessions";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneActionsLayer } from "./PhoneActionsLayer";
import { usePhoneActions } from "./usePhoneActions";

vi.mock("../../App/useStarredSessions/loadStarredKeys", () => ({
	backlogCwds: () => [],
	loadStarredKeys: async () => new Set<string>(),
}));
vi.mock("../../../../../backlog/web/ui/api", () => ({
	updateItemStatus: vi.fn(),
}));
vi.mock("../../clientFailures/reportCaughtError", () => ({
	reportCaughtError: vi.fn(),
}));

beforeEach(() => {
	vi.mocked(updateItemStatus).mockReset();
});
afterEach(cleanup);

const backlogSession: SessionInfo = {
	id: "s1",
	name: "s1",
	title: "Backlog run",
	status: "running",
	commandType: "claude",
	startedAt: 0,
	cwd: "/repo",
	activity: { kind: "backlog", itemId: 1372, phase: 1, totalPhases: 3 },
} as SessionInfo;

function OpenSheet({ session }: { session: SessionInfo }) {
	const { openSheet } = usePhoneActions();
	return (
		<button type="button" onClick={() => openSheet(session)}>
			open
		</button>
	);
}

function renderLayer(session: SessionInfo) {
	const socket = {
		sessions: [session],
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
			<MemoryRouter initialEntries={[`/session/${session.id}`]}>
				<StarredSessionsProvider
					sessions={[session]}
					setSessionStarred={socket.setStarred}
				>
					<PhoneActionsLayer socket={socket}>
						<Routes>
							<Route path="/" element={<div>home</div>} />
							<Route
								path="/session/:id"
								element={<OpenSheet session={session} />}
							/>
						</Routes>
					</PhoneActionsLayer>
				</StarredSessionsProvider>
			</MemoryRouter>
		</ThemeProvider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "open" }));
	return socket;
}

describe("phone Mark done", () => {
	it("hides the row for sessions without a backlog item or that are done", () => {
		renderLayer({ ...backlogSession, activity: undefined });
		expect(screen.queryByRole("button", { name: /Mark done/ })).toBeNull();
		cleanup();
		renderLayer({ ...backlogSession, status: "done" });
		expect(screen.queryByRole("button", { name: /Mark done/ })).toBeNull();
	});

	it("confirms in the sheet, marks the item done and dismisses the session", async () => {
		vi.mocked(updateItemStatus).mockResolvedValue({} as never);
		const socket = renderLayer(backlogSession);

		fireEvent.click(screen.getByRole("button", { name: "Mark done…" }));
		expect(screen.getByText(/1 of 3 phases completed/)).toBeTruthy();
		expect(screen.getByText(/a1372/)).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

		await waitFor(() =>
			expect(socket.dismissSession).toHaveBeenCalledWith("s1"),
		);
		expect(updateItemStatus).toHaveBeenCalledWith(
			1372,
			"done",
			"/repo",
			undefined,
		);
		expect(await screen.findByText("home")).toBeTruthy();
	});

	it("routes the update to a linked node", async () => {
		vi.mocked(updateItemStatus).mockResolvedValue({} as never);
		const socket = renderLayer({ ...backlogSession, node: "wsl" });

		fireEvent.click(screen.getByRole("button", { name: "Mark done…" }));
		fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

		await waitFor(() => expect(socket.dismissSession).toHaveBeenCalled());
		expect(updateItemStatus).toHaveBeenCalledWith(1372, "done", "/repo", "wsl");
	});

	it("cancels without changes", () => {
		const socket = renderLayer(backlogSession);

		fireEvent.click(screen.getByRole("button", { name: "Mark done…" }));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(updateItemStatus).not.toHaveBeenCalled();
		expect(socket.dismissSession).not.toHaveBeenCalled();
	});

	it("keeps the session running and shows the error when the update fails", async () => {
		vi.mocked(updateItemStatus).mockImplementation(async () => {
			throw new Error("boom");
		});
		const socket = renderLayer(backlogSession);

		fireEvent.click(screen.getByRole("button", { name: "Mark done…" }));
		fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

		expect((await screen.findByRole("alert")).textContent).toMatch(
			/Failed to mark item/,
		);
		expect(socket.dismissSession).not.toHaveBeenCalled();
	});
});
