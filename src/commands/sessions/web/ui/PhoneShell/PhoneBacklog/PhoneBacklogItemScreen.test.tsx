// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	act,
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
let peerCapabilities: HarnessCapabilities | undefined;

vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: (node?: string) =>
		node === "pc" && peerCapabilities ? peerCapabilities : capabilities,
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
	peerCapabilities = undefined;
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
	vi.useRealTimers();
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

function linkedSocketWith(sessions: SessionInfo[]) {
	return {
		...socketWith(sessions),
		nodeSelection: { names: ["mac", "pc"], visible: true },
	} as SessionSocket;
}

const peerPath = "/backlog/a7?cwd=/pc/assist&node=pc";

function session(
	id: string,
	assistArgs: string[],
	extra: Partial<SessionInfo> = {},
): SessionInfo {
	return { id, status: "running", assistArgs, ...extra } as SessionInfo;
}

function screenFor(
	socket: SessionSocket,
	path = "/backlog/a7?cwd=/mac/assist",
) {
	return (
		<ThemeProvider theme={createDesignTheme("dark")}>
			<MemoryRouter initialEntries={[path]}>
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
			["refine", "--once", "--harness", "claude", "a7"],
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

	it("passes the picked harness", async () => {
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
			["refine", "--once", "--harness", "claude", "a7"],
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

	it("refines on a linked node and lands only in that node's refinement", async () => {
		const socket = linkedSocketWith([]);
		const { rerender } = render(screenFor(socket, peerPath));

		fireEvent.click(await screen.findByRole("button", { name: "Refine" }));
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "claude", "a7"],
			"/pc/assist",
			{ node: "pc" },
		);

		const args = ["refine", "--once", "--harness", "claude", "a7"];
		const local = session("local", args, { cwd: "/pc/assist" });
		rerender(
			screenFor({ ...socket, sessions: [local] } as SessionSocket, peerPath),
		);
		await screen.findByRole("button", { name: "Refining…" });
		expect(screen.queryByText("session screen")).toBeNull();

		const remote = session("pc:r1", args, { cwd: "/pc/assist", node: "pc" });
		rerender(
			screenFor(
				{ ...socket, sessions: [local, remote] } as SessionSocket,
				peerPath,
			),
		);
		await waitFor(() => screen.getByText("session screen"));
	});

	it("starts on a linked node", async () => {
		const socket = linkedSocketWith([]);
		render(screenFor(socket, peerPath));

		fireEvent.click(
			await screen.findByRole("button", { name: "Start phase 2" }),
		);
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["backlog", "run", "a7"],
			"/pc/assist",
			{ node: "pc" },
		);
	});

	it("gates Refine on the linked node's harness support", async () => {
		peerCapabilities = withFeatures({
			build: { claude: available, codex: available },
			refine: { codex: available },
		});
		const socket = linkedSocketWith([]);
		render(screenFor(socket, peerPath));

		const refine = await screen.findByRole("button", { name: "Refine" });
		expect(refine).toHaveProperty("disabled", true);
		screen.getByText("Refine unavailable with claude on pc");

		fireEvent.click(screen.getByRole("radio", { name: "codex" }));
		fireEvent.click(screen.getByRole("button", { name: "Refine" }));
		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "codex", "a7"],
			"/pc/assist",
			{ node: "pc" },
		);
	});

	it("blocks Refine and Start when the repo is not cloned on the picked node", async () => {
		const socket = linkedSocketWith([]);
		render(screenFor(socket));

		fireEvent.click(await screen.findByRole("radio", { name: "pc" }));
		screen.getByText("Not cloned on pc");
		const refine = screen.getByRole("button", { name: "Refine" });
		expect(refine).toHaveProperty("disabled", true);
		expect(
			screen.getByRole("button", { name: "Start phase 2" }),
		).toHaveProperty("disabled", true);
		fireEvent.click(refine);
		expect(socket.createAssistSession).not.toHaveBeenCalled();
	});

	it("allows a retry when the refinement never appears", async () => {
		const socket = socketWith([]);
		render(screenFor(socket));

		const refine = await screen.findByRole("button", { name: "Refine" });
		vi.useFakeTimers();
		fireEvent.click(refine);
		screen.getByRole("button", { name: "Refining…" });
		act(() => {
			vi.advanceTimersByTime(20_000);
		});
		fireEvent.click(screen.getByRole("button", { name: "Refine" }));
		expect(socket.createAssistSession).toHaveBeenCalledTimes(2);
	});

	it("keeps waiting for the refinement when an implementation run starts", async () => {
		const socket = socketWith([]);
		const { rerender } = render(screenFor(socket));

		fireEvent.click(await screen.findByRole("button", { name: "Refine" }));
		const run = session("run", ["backlog", "run", "a7"]);
		rerender(screenFor({ ...socket, sessions: [run] } as SessionSocket));

		await screen.findByRole("button", { name: "Open session" });
		screen.getByRole("button", { name: "Refining…" });
		expect(screen.queryByText("session screen")).toBeNull();
	});
});
