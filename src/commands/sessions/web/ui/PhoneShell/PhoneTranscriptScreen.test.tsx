// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { HistoricalSession, SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneTranscriptScreen } from "./PhoneTranscriptScreen";

vi.mock("../App/SessionContent/SessionArea/TranscriptArea", () => ({
	TranscriptArea: () => null,
}));

afterEach(cleanup);

const entry: HistoricalSession = {
	sessionId: "conv-1",
	name: "Fix login",
	project: "assist",
	cwd: "/repo/wt",
	timestamp: "2026-11-01T00:00:00Z",
	harness: "codex",
	node: "pc",
};

const resumed: SessionInfo = {
	id: "live-9",
	name: "Fix login (R)",
	status: "waiting",
	commandType: "claude",
	startedAt: 0,
	harnessSessionId: "conv-1",
};

function socketWith(sessions: SessionInfo[]) {
	return {
		sessions,
		history: [entry],
		transcript: [],
		viewTranscript: vi.fn(),
		clearTranscript: vi.fn(),
		resumeSession: vi.fn(),
	} as unknown as SessionSocket;
}

function renderScreen(socket: SessionSocket) {
	const ui = (s: SessionSocket) => (
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter initialEntries={["/history/conv-1?node=pc"]}>
				<Routes>
					<Route
						path="/history/:id"
						element={<PhoneTranscriptScreen socket={s} />}
					/>
					<Route path="/session/:id" element={<p>live screen</p>} />
				</Routes>
			</MemoryRouter>
		</ThemeProvider>
	);
	const view = render(ui(socket));
	return { rerender: (s: SessionSocket) => view.rerender(ui(s)) };
}

describe("PhoneTranscriptScreen resume", () => {
	it("resumes with the entry's cwd, name, harness and node", () => {
		const socket = socketWith([]);
		renderScreen(socket);
		fireEvent.click(screen.getByRole("button", { name: "Resume" }));
		expect(socket.resumeSession).toHaveBeenCalledWith(
			"conv-1",
			"/repo/wt",
			"Fix login",
			"codex",
			"pc",
		);
		expect(screen.getByText("Resuming…")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Resume" }).hasAttribute("disabled"),
		).toBe(true);
	});

	it("opens the live session bound to the resumed conversation", () => {
		const socket = socketWith([]);
		const { rerender } = renderScreen(socket);
		fireEvent.click(screen.getByRole("button", { name: "Resume" }));
		expect(screen.queryByText("live screen")).toBeNull();
		rerender({ ...socket, sessions: [resumed] } as SessionSocket);
		expect(screen.getByText("live screen")).toBeTruthy();
	});

	it("does not navigate to a matching session before Resume is tapped", () => {
		renderScreen(socketWith([resumed]));
		expect(screen.queryByText("live screen")).toBeNull();
	});
});
