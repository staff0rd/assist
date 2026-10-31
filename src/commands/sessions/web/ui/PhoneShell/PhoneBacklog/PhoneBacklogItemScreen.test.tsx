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
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneBacklogItemScreen } from "./PhoneBacklogItemScreen";

vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => ({
		exposeCodexActions: false,
		exposePiActions: false,
	}),
}));

const item = {
	id: 7,
	type: "story",
	name: "Phone backlog",
	status: "in-progress",
	acceptanceCriteria: ["Starts from the phone"],
	plan: [
		{ name: "List", tasks: [{ task: "Show items" }] },
		{ name: "Start", tasks: [{ task: "Run it" }] },
	],
	currentPhase: 2,
	origin: "github.com/x/assist",
};

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => Response.json(item)),
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function socketWith(sessions: SessionInfo[]) {
	return {
		sessions,
		currentCwd: "/mac/assist",
		history: [],
		nodes: { local: "mac", links: [] },
		nodeSelection: { names: ["mac"], visible: false },
		createAssistSession: vi.fn(),
	} as unknown as SessionSocket;
}

function screenFor(socket: SessionSocket) {
	return (
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter initialEntries={["/backlog/a7?cwd=/mac/assist"]}>
				<Routes>
					<Route
						path="backlog/:itemId"
						element={<PhoneBacklogItemScreen socket={socket} />}
					/>
					<Route path="session/:id" element={<div>session screen</div>} />
				</Routes>
			</MemoryRouter>
		</ThemeProvider>
	);
}

describe("PhoneBacklogItemScreen", () => {
	it("starts the item and lands in its new session", async () => {
		const socket = socketWith([]);
		const { rerender } = render(screenFor(socket));

		fireEvent.click(
			await screen.findByRole("button", { name: "Start phase 2" }),
		);
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["backlog", "run", "a7"],
			"/mac/assist",
		);

		const started = {
			id: "s1",
			status: "running",
			assistArgs: ["backlog", "run", "a7"],
		} as SessionInfo;
		rerender(screenFor({ ...socket, sessions: [started] } as SessionSocket));
		await waitFor(() => screen.getByText("session screen"));
	});

	it("offers Open session when the item already has a live session", async () => {
		const live = {
			id: "s2",
			status: "running",
			assistArgs: ["backlog", "run", "a7"],
		} as SessionInfo;
		render(screenFor(socketWith([live])));

		fireEvent.click(
			await screen.findByRole("button", { name: "Open session" }),
		);
		await waitFor(() => screen.getByText("session screen"));
	});
});
