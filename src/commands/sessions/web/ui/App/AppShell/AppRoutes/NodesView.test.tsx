// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkStatus } from "../../../../../daemon/links/LinkStatus";
import type { NodesState } from "../../../types";
import { NodeSelectionContext } from "../../../useNodeSelectionContext";
import { NodesView } from "./NodesView";

let fetchMock: ReturnType<typeof vi.fn>;

const win: LinkStatus = {
	name: "win",
	url: "http://win:3100",
	state: "connected",
	peerVersion: "0.1123.0",
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

function view(nodes: NodesState) {
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
				<NodesView />
			</NodeSelectionContext.Provider>
		</MemoryRouter>
	);
}

function respond(body: unknown, status = 200) {
	fetchMock.mockResolvedValue(Response.json(body, { status }));
}

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function row(name: string) {
	return screen.getByRole("article", { name });
}

describe("NodesView", () => {
	it("lists this node first without a Remove action, then each link's state", () => {
		render(view({ local: "mac", links: [win, devbox, old] }));
		const rows = screen.getAllByRole("article");
		expect(rows.map((r) => r.getAttribute("aria-label"))).toEqual([
			"mac",
			"win",
			"devbox",
			"old",
		]);
		expect(within(row("mac")).getByText("This node")).toBeTruthy();
		expect(within(row("mac")).queryByText("Remove")).toBeNull();
		expect(within(row("win")).getByText("Connected")).toBeTruthy();
		expect(within(row("win")).getByText("assist 0.1123.0")).toBeTruthy();
	});

	it("shows a disconnected node's last error and points version-blocked nodes at Updates", () => {
		render(view({ local: "mac", links: [devbox, old] }));
		expect(
			within(row("devbox")).getByText("connect ECONNREFUSED 100.88.4.12:3100"),
		).toBeTruthy();
		expect(within(row("old")).getByText(/older link protocol/)).toBeTruthy();
		expect(
			within(row("old")).getByRole("link", { name: "Updates page" }),
		).toHaveProperty("href", expect.stringMatching(/\/updates$/));
	});

	it("updates as link states change", () => {
		const { rerender } = render(view({ local: "mac", links: [win] }));
		rerender(
			view({ local: "mac", links: [{ ...win, state: "disconnected" }] }),
		);
		expect(within(row("win")).getByText("Disconnected")).toBeTruthy();
	});

	it("asks for inline confirmation and keeps the node on Keep", () => {
		render(view({ local: "mac", links: [win] }));
		fireEvent.click(screen.getByRole("button", { name: "Remove win" }));
		fireEvent.click(screen.getByRole("button", { name: "Keep" }));
		expect(fetchMock).not.toHaveBeenCalled();
		expect(screen.getByRole("button", { name: "Remove win" })).toBeTruthy();
	});

	it("unlinks the node on confirm, drops its row and toasts", async () => {
		respond({ ok: true, daemon: { kind: "reloaded" } });
		render(view({ local: "mac", links: [win, devbox] }));
		fireEvent.click(screen.getByRole("button", { name: "Remove win" }));
		const confirm = screen.getByRole("group", { name: "Confirm removing win" });
		fireEvent.click(within(confirm).getByRole("button", { name: "Remove" }));
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
		respond({ ok: true, daemon: { kind: "not-running" } });
		render(view({ local: "mac", links: [win] }));
		fireEvent.click(screen.getByRole("button", { name: "Remove win" }));
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		await waitFor(() =>
			expect(
				screen.getByText(
					"Removed win. The daemon picks the change up when it starts.",
				),
			).toBeTruthy(),
		);
	});

	it("keeps the row and shows the error when the unlink fails", async () => {
		respond({ error: "No link named win" }, 404);
		render(view({ local: "mac", links: [win] }));
		fireEvent.click(screen.getByRole("button", { name: "Remove win" }));
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		await waitFor(() =>
			expect(
				screen.getByText("Could not remove win: No link named win"),
			).toBeTruthy(),
		);
		expect(row("win")).toBeTruthy();
	});
});
