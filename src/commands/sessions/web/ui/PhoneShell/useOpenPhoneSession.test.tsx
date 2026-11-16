// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StarredSessionsProvider } from "../App/useStarredSessions";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneActionsLayer } from "./PhoneActions/PhoneActionsLayer";
import { usePhoneActions } from "./PhoneActions/usePhoneActions";
import { useOpenPhoneSession } from "./useOpenPhoneSession";

vi.mock("../App/useStarredSessions/loadStarredKeys", () => ({
	backlogCwds: () => [],
	loadStarredKeys: async () => new Set<string>(),
}));

afterEach(cleanup);

const live: SessionInfo = {
	id: "s1",
	name: "s1",
	title: "Live session",
	status: "running",
	commandType: "claude",
	startedAt: 0,
};

type State = Pick<SessionSocket, "sessionsLoaded" | "reconnecting"> & {
	sessions: SessionInfo[];
};

function Screen({ socket }: { socket: SessionSocket }) {
	const session = useOpenPhoneSession(socket);
	const { dismiss } = usePhoneActions();
	return (
		<>
			<div>open {session?.title ?? "none"}</div>
			{session && (
				<button type="button" onClick={() => dismiss(session)}>
					End
				</button>
			)}
		</>
	);
}

function tree(state: State) {
	const socket = {
		...state,
		dismissSession: vi.fn(),
		setStarred: vi.fn(),
	} as unknown as SessionSocket;
	return (
		<MemoryRouter initialEntries={["/", "/session/s1"]} initialIndex={1}>
			<StarredSessionsProvider
				sessions={state.sessions}
				setSessionStarred={socket.setStarred}
			>
				<PhoneActionsLayer socket={socket}>
					<Routes>
						<Route path="/" element={<div>session list</div>} />
						<Route path="/session/:id" element={<Screen socket={socket} />} />
					</Routes>
				</PhoneActionsLayer>
			</StarredSessionsProvider>
		</MemoryRouter>
	);
}

const loaded = { sessionsLoaded: true, reconnecting: false };

describe("useOpenPhoneSession", () => {
	it("returns to the list with a titled toast when the open session ends", () => {
		const { rerender } = render(tree({ ...loaded, sessions: [live] }));
		expect(screen.getByText("open Live session")).toBeTruthy();
		rerender(tree({ ...loaded, sessions: [] }));
		expect(screen.getByText("session list")).toBeTruthy();
		expect(screen.getByText("Live session ended")).toBeTruthy();
	});

	it.each([
		{ sessionsLoaded: true, reconnecting: true },
		{ sessionsLoaded: false, reconnecting: false },
	])("keeps the last-known session while %o", (state) => {
		const { rerender } = render(tree({ ...state, sessions: [live] }));
		rerender(tree({ ...state, sessions: [] }));
		expect(screen.getByText("open Live session")).toBeTruthy();
		expect(screen.queryByText("session list")).toBeNull();
		expect(screen.queryByText(/ended/)).toBeNull();
	});

	it("shows Session ended when opened for an absent id", () => {
		render(tree({ ...loaded, sessions: [] }));
		expect(screen.getByText("session list")).toBeTruthy();
		expect(screen.getByText("Session ended")).toBeTruthy();
	});

	it("does not toast when ended from the action sheet", () => {
		const { rerender } = render(tree({ ...loaded, sessions: [live] }));
		act(() => screen.getByRole("button", { name: "End" }).click());
		rerender(tree({ ...loaded, sessions: [] }));
		expect(screen.getByText("session list")).toBeTruthy();
		expect(screen.queryByText(/ended/)).toBeNull();
	});
});
