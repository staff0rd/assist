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
import type { HarnessCapabilities } from "../../parseHarnessCapabilities";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneBacklogItemScreen } from "./PhoneBacklogItemScreen";

let capabilities: HarnessCapabilities;

vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => capabilities,
}));

function withFeatures(
	features: HarnessCapabilities["features"],
): HarnessCapabilities {
	return {
		exposeCodexActions: true,
		exposePiActions: false,
		engine: "claude",
		runHarness: "claude",
		features,
	};
}

const available = { available: true } as const;

let item: Record<string, unknown>;

const storyItem = {
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
	item = storyItem;
	capabilities = withFeatures({
		build: { claude: available, codex: available },
		refine: { claude: available, codex: available },
	});
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

	it("refines the item and lands in the new refinement, not the live run", async () => {
		const run = {
			id: "run",
			status: "running",
			assistArgs: ["backlog", "run", "a7"],
		} as SessionInfo;
		const socket = socketWith([run]);
		const { rerender } = render(screenFor(socket));

		const refine = await screen.findByRole("button", { name: "Refine" });
		screen.getByRole("button", { name: "Open session" });
		fireEvent.click(refine);
		fireEvent.click(screen.getByRole("button", { name: "Refining…" }));
		expect(socket.createAssistSession).toHaveBeenCalledTimes(1);
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["refine", "--once", "a7"],
			"/mac/assist",
		);

		const refining = {
			id: "refining",
			status: "running",
			assistArgs: ["refine", "--once", "a7"],
		} as SessionInfo;
		rerender(
			screenFor({ ...socket, sessions: [run, refining] } as SessionSocket),
		);
		await waitFor(() => screen.getByText("session screen"));
	});

	it("waits for a new refinement rather than an earlier one", async () => {
		const earlier = {
			id: "earlier",
			status: "running",
			assistArgs: ["refine", "--once", "a7"],
		} as SessionInfo;
		render(screenFor(socketWith([earlier])));

		fireEvent.click(await screen.findByRole("button", { name: "Refine" }));
		await screen.findByRole("button", { name: "Refining…" });
		expect(screen.queryByText("session screen")).toBeNull();
	});

	it("passes the picked harness when it is not the engine", async () => {
		const socket = socketWith([]);
		render(screenFor(socket));

		fireEvent.click(await screen.findByRole("radio", { name: "codex" }));
		fireEvent.click(screen.getByRole("button", { name: "Refine" }));
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "codex", "a7"],
			"/mac/assist",
		);
	});

	it("offers Refine when Start is not offered", async () => {
		item = { ...storyItem, status: "done" };
		const socket = socketWith([]);
		render(screenFor(socket));

		fireEvent.click(await screen.findByRole("button", { name: "Refine" }));
		expect(screen.queryByRole("button", { name: /^Start/ })).toBeNull();
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["refine", "--once", "a7"],
			"/mac/assist",
		);
	});

	it("disables Refine when the harness cannot refine", async () => {
		capabilities = withFeatures({ build: { claude: available } });
		const socket = socketWith([]);
		render(screenFor(socket));

		const refine = await screen.findByRole("button", { name: "Refine" });
		expect(refine).toHaveProperty("disabled", true);
		screen.getByText("Refine unavailable with claude on mac");
		fireEvent.click(refine);
		expect(socket.createAssistSession).not.toHaveBeenCalled();
	});
});
