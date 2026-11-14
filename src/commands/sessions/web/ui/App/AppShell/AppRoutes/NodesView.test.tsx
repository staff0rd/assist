// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkStatus } from "../../../../../daemon/links/LinkStatus";
import type { NodeUpdateStatus } from "../../../../../shared/NodeUpdateStatus";
import type { NodesState } from "../../../types";
import { NodeSelectionContext } from "../../../useNodeSelectionContext";
import type { NodeUpdateEntry } from "../NodeUpdateEntry";
import { LocalRestartContext } from "../useLocalRestartContext";
import { NodeUpdatesContext } from "../useNodeUpdatesContext";
import { useWebserverRestart } from "../useWebserverRestart";
import { NodesView } from "./NodesView";

let unlinkResponse: () => Response;
let probeResponse: () => Response;
let linkResponse: () => Response;
let fetchMock: ReturnType<typeof vi.fn>;

function status(
	name: string,
	overrides: Partial<NodeUpdateStatus> = {},
): NodeUpdateEntry {
	return {
		name,
		local: name === "mac",
		status: {
			nodeName: name,
			installDir: "/git/assist",
			running: "0.1123.0",
			built: "0.1123.0",
			restart: [],
			daemonReachable: true,
			autoRestart: false,
			loop: { phase: "waiting", since: new Date().toISOString() },
			history: [],
			...overrides,
		},
	};
}

const win: LinkStatus = {
	name: "win",
	url: "http://win:3100",
	state: "connected",
	peerVersion: "0.1122.0",
};
const devbox: LinkStatus = {
	name: "devbox",
	url: "https://devbox:3100",
	state: "disconnected",
	error: "connect ECONNREFUSED 100.88.4.12:3100",
};
const old: LinkStatus = {
	name: "old",
	url: "https://old:3100",
	state: "version-blocked",
	peerProtocol: 3,
	protocol: 4,
};

const entries = [
	status("mac"),
	status("win", { running: "0.1122.0", restart: ["daemon"] }),
	status("devbox", { built: "0.1124.0", restart: ["daemon"] }),
];

function RestartProvider({ children }: { children: ReactNode }) {
	const web = useWebserverRestart("webserver", false);
	return (
		<LocalRestartContext.Provider value={web}>
			{children}
		</LocalRestartContext.Provider>
	);
}

function view(nodes: NodesState, updates: NodeUpdateEntry[] = entries) {
	return (
		<MemoryRouter>
			<NodeSelectionContext.Provider
				value={{
					nodes,
					names: [],
					visible: true,
					selected: nodes.local,
					select: () => {},
				}}
			>
				<NodeUpdatesContext.Provider
					value={{ entries: updates, loading: false, refresh: () => {} }}
				>
					<RestartProvider>
						<NodesView selectSession={() => {}} />
					</RestartProvider>
				</NodeUpdatesContext.Provider>
			</NodeSelectionContext.Provider>
		</MemoryRouter>
	);
}

beforeEach(() => {
	unlinkResponse = () =>
		Response.json({ ok: true, daemon: { kind: "reloaded" } });
	probeResponse = () =>
		Response.json({
			name: "pc-linux",
			version: "0.1126.0",
			url: "https://pc-linux:3100",
		});
	linkResponse = () =>
		Response.json({ ok: true, daemon: { kind: "reloaded" } });
	const routes: Record<string, () => Response> = {
		"/api/nodes/unlink": () => unlinkResponse(),
		"/api/nodes/probe": () => probeResponse(),
		"/api/nodes/link": () => linkResponse(),
	};
	fetchMock = vi.fn(async (url: string) =>
		(routes[url] ?? (() => Response.json({ history: [] })))(),
	);
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function row(name: string) {
	return screen.getByRole("article", { name });
}

function summary(name: string) {
	return within(row(name).firstElementChild as HTMLElement);
}

function openMenu(name: string) {
	fireEvent.click(
		within(row(name)).getByRole("button", { name: `More actions for ${name}` }),
	);
	return screen.getByRole("menu");
}

function removeVia(name: string) {
	fireEvent.click(within(openMenu(name)).getByText("Remove node…"));
	const confirm = screen.getByRole("group", {
		name: `Confirm removing ${name}`,
	});
	fireEvent.click(within(confirm).getByRole("button", { name: "Remove" }));
}

describe("NodesView", () => {
	it("lists this node first, tagged and without Remove, then each linked node", () => {
		render(view({ local: "mac", links: [win, devbox, old] }));
		expect(
			screen.getAllByRole("article").map((r) => r.getAttribute("aria-label")),
		).toEqual(["mac", "win", "devbox", "old"]);
		expect(within(row("mac")).getByText("This node")).toBeTruthy();
		expect(within(openMenu("mac")).queryByText("Remove node…")).toBeNull();
	});

	it("shows one chip per row with a link problem outranking the update state", () => {
		render(view({ local: "mac", links: [win, devbox, old] }));
		expect(summary("mac").getByText("Up to date")).toBeTruthy();
		expect(summary("win").getByText("Restart to update")).toBeTruthy();
		expect(summary("devbox").getByText("Disconnected")).toBeTruthy();
		expect(summary("devbox").queryByText("Restart to update")).toBeNull();
		expect(summary("old").getByText("Link blocked")).toBeTruthy();
	});

	it("offers one contextual action and keeps pause and auto-restart in the menu", () => {
		render(view({ local: "mac", links: [win] }));
		expect(
			within(row("win")).getAllByRole("button", { name: "Restart" }),
		).toHaveLength(1);
		const menu = openMenu("win");
		expect(within(menu).getByText("Pause updates")).toBeTruthy();
		expect(within(menu).getByText("Auto-restart")).toBeTruthy();
		expect(within(menu).getByText("Remove node…")).toBeTruthy();
	});

	it("opens the detail by itself for nodes needing attention only", () => {
		render(view({ local: "mac", links: [win, devbox, old] }));
		expect(
			within(row("mac")).queryByRole("region", { name: "Connection" }),
		).toBeNull();
		const devboxRow = within(row("devbox"));
		expect(
			devboxRow.getByText("connect ECONNREFUSED 100.88.4.12:3100"),
		).toBeTruthy();
		expect(
			devboxRow.getByText("Update state comes back when the link reconnects."),
		).toBeTruthy();
		expect(
			within(row("old")).getByText(/runs an older link protocol/),
		).toBeTruthy();
		expect(within(row("old")).getByText("assist update")).toBeTruthy();
		expect(
			within(row("win")).queryByRole("region", { name: "Updates" }),
		).toBeNull();
	});

	it("shows a ready node's advice once its chevron is opened", () => {
		render(view({ local: "mac", links: [win] }));
		fireEvent.click(
			screen.getByRole("button", { name: "Show details for win" }),
		);
		expect(
			within(row("win")).getByText(/is built but not running/),
		).toBeTruthy();
	});

	it("opens a calm node's detail from its chevron", () => {
		render(view({ local: "mac", links: [] }));
		fireEvent.click(
			screen.getByRole("button", { name: "Show details for mac" }),
		);
		expect(within(row("mac")).getByText("Connection")).toBeTruthy();
		expect(within(row("mac")).getByText("Updates")).toBeTruthy();
	});

	it("updates as link states change", () => {
		const { rerender } = render(view({ local: "mac", links: [win] }));
		rerender(
			view({ local: "mac", links: [{ ...win, state: "disconnected" }] }),
		);
		expect(summary("win").getByText("Disconnected")).toBeTruthy();
	});

	it("keeps the node when Keep is chosen", () => {
		render(view({ local: "mac", links: [win] }));
		fireEvent.click(within(openMenu("win")).getByText("Remove node…"));
		fireEvent.click(screen.getByRole("button", { name: "Keep" }));
		expect(fetchMock).not.toHaveBeenCalledWith(
			"/api/nodes/unlink",
			expect.anything(),
		);
		expect(row("win")).toBeTruthy();
	});

	it("unlinks the node on confirm, drops its row and toasts", async () => {
		render(view({ local: "mac", links: [win, devbox] }));
		removeVia("win");
		await waitFor(() => expect(screen.getByText("Removed win")).toBeTruthy());
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/nodes/unlink",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ name: "win" }),
			}),
		);
		expect(screen.queryByRole("article", { name: "win" })).toBeNull();
	});

	it("says the daemon picks the change up when it is not running", async () => {
		unlinkResponse = () =>
			Response.json({ ok: true, daemon: { kind: "not-running" } });
		render(view({ local: "mac", links: [win] }));
		removeVia("win");
		await waitFor(() =>
			expect(
				screen.getByText(
					"Removed win. The daemon picks the change up when it starts.",
				),
			).toBeTruthy(),
		);
	});

	it("keeps the row and shows the error when the unlink fails", async () => {
		unlinkResponse = () =>
			Response.json({ error: "No link named win" }, { status: 404 });
		render(view({ local: "mac", links: [win] }));
		removeVia("win");
		await waitFor(() =>
			expect(
				screen.getByText("Could not remove win: No link named win"),
			).toBeTruthy(),
		);
		expect(row("win")).toBeTruthy();
	});

	describe("header actions", () => {
		const restartReady = () =>
			screen.getByRole("button", { name: /^Restart ready/ });

		it("orders Add node, Check now, then Restart ready", () => {
			render(view({ local: "mac", links: [win] }));
			const labels = ["Add node", "Check now", "Restart ready"];
			expect(
				screen
					.getAllByRole("button")
					.map((b) => b.textContent ?? "")
					.map((t) => labels.find((l) => t.startsWith(l)))
					.filter(Boolean),
			).toEqual(labels);
			expect(
				screen.getByRole("button", { name: "Add node" }).className,
			).toContain("MuiButton-outlined");
			expect(
				screen.getByRole("button", { name: "Check now" }).className,
			).toContain("MuiButton-outlined");
		});

		it("makes Restart ready contained when a node is ready", () => {
			render(view({ local: "mac", links: [win] }));
			expect(restartReady().className).toContain("MuiButton-contained");
			expect(restartReady().hasAttribute("disabled")).toBe(false);
		});

		it("makes Restart ready outlined and disabled when no node is ready", () => {
			render(view({ local: "mac", links: [win] }, [status("mac")]));
			expect(restartReady().className).toContain("MuiButton-outlined");
			expect(restartReady().hasAttribute("disabled")).toBe(true);
		});
	});

	describe("Add node", () => {
		function openDialog() {
			render(view({ local: "mac", links: [win] }));
			fireEvent.click(screen.getByRole("button", { name: "Add node" }));
			const dialog = screen.getByRole("dialog", { name: "Add node" });
			fireEvent.change(within(dialog).getByLabelText("Web server URL"), {
				target: { value: "https://pc-linux:3100" },
			});
			return within(dialog);
		}

		it("checks the URL, shows the found node, then links it", async () => {
			const dialog = openDialog();
			fireEvent.click(dialog.getByRole("button", { name: "Check" }));
			const link = await dialog.findByRole("button", {
				name: "Link pc-linux",
			});
			expect(fetchMock).toHaveBeenCalledWith(
				"/api/nodes/probe",
				expect.objectContaining({
					body: JSON.stringify({ url: "https://pc-linux:3100" }),
				}),
			);
			expect(dialog.getByLabelText("Found node").textContent).toContain(
				"assist 0.1126.0",
			);
			fireEvent.click(link);
			await waitFor(() =>
				expect(screen.getByText("Linked pc-linux")).toBeTruthy(),
			);
			expect(fetchMock).toHaveBeenCalledWith(
				"/api/nodes/link",
				expect.objectContaining({
					body: JSON.stringify({
						name: "pc-linux",
						url: "https://pc-linux:3100",
					}),
				}),
			);
			expect(screen.queryByRole("dialog")).toBeNull();
		});

		it.each([
			"mac is this node; enter another machine's URL",
			"win is already linked at http://win:3100",
			"old runs an older link protocol (3, this node 4); run assist update on old first",
		])("shows refusal inline and allows checking again: %s", async (error) => {
			probeResponse = () => Response.json({ error }, { status: 422 });
			const dialog = openDialog();
			fireEvent.click(dialog.getByRole("button", { name: "Check" }));
			expect((await dialog.findByRole("alert")).textContent).toContain(error);
			const retry = dialog.getByRole("button", { name: "Check again" });
			expect(dialog.queryByLabelText("Found node")).toBeNull();
			expect(fetchMock).not.toHaveBeenCalledWith(
				"/api/nodes/link",
				expect.anything(),
			);
			probeResponse = () =>
				Response.json({
					name: "pc-linux",
					version: "0.1126.0",
					url: "https://pc-linux:3100",
				});
			fireEvent.click(retry);
			await dialog.findByRole("button", { name: "Link pc-linux" });
			expect(dialog.queryByRole("alert", { name: error })).toBeNull();
			expect(dialog.queryByText(error)).toBeNull();
		});

		it("goes back to Check when the URL is edited after a probe", async () => {
			const dialog = openDialog();
			fireEvent.click(dialog.getByRole("button", { name: "Check" }));
			await dialog.findByRole("button", { name: "Link pc-linux" });
			fireEvent.change(dialog.getByLabelText("Web server URL"), {
				target: { value: "https://other:3100" },
			});
			expect(dialog.getByRole("button", { name: "Check" })).toBeTruthy();
			expect(dialog.queryByLabelText("Found node")).toBeNull();
		});

		it("says the daemon picks the link up when it is not running", async () => {
			linkResponse = () =>
				Response.json({ ok: true, daemon: { kind: "not-running" } });
			const dialog = openDialog();
			fireEvent.click(dialog.getByRole("button", { name: "Check" }));
			fireEvent.click(
				await dialog.findByRole("button", { name: "Link pc-linux" }),
			);
			await waitFor(() =>
				expect(
					screen.getByText(
						"Linked pc-linux. The daemon picks the change up when it starts.",
					),
				).toBeTruthy(),
			);
		});
	});
});
