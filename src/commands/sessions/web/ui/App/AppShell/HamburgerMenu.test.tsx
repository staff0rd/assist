// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HamburgerMenu } from "./HamburgerMenu";
import { NodeSelectionContext } from "../../useNodeSelectionContext";
import { SessionLaunchContext } from "../../useSessionLaunchContext";

let fetchMock: ReturnType<typeof vi.fn>;

function renderMenu(
	launchAssist: () => void,
	armUpdateReload = () => {},
	selected = "wsl",
) {
	return render(
		<MemoryRouter initialEntries={["/sessions"]}>
			<NodeSelectionContext.Provider
				value={{
					nodes: {
						local: "wsl",
						links: [
							{ name: "win", url: "http://win:3100", state: "connected" },
						],
					},
					names: ["wsl", "win"],
					visible: true,
					selected,
					select: () => {},
				}}
			>
				<SessionLaunchContext.Provider
					value={{
						launchAssist,
						launchAgentInStream: () => {},
						resumeSession: () => {},
						armUpdateReload,
					}}
				>
					<HamburgerMenu
						mode="light"
						toggle={() => {}}
						sessions={[]}
						reconnecting={false}
					/>
					<Routes>
						<Route path="/config" element={<div>config page</div>} />
						<Route path="/sessions" element={<div>sessions page</div>} />
					</Routes>
				</SessionLaunchContext.Provider>
			</NodeSelectionContext.Provider>
		</MemoryRouter>,
	);
}

beforeEach(() => {
	fetchMock = vi.fn().mockResolvedValue({ ok: true });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("HamburgerMenu", () => {
	it("shows this node's name at the top of the menu", async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ nodeName: "pc-windows" }),
		});
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

		expect(await screen.findByText("pc-windows")).toBeTruthy();
	});

	it("launches an assist update session with no cwd on confirm", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(launchAssist).toHaveBeenCalledWith(["update"]);
	});

	it("arms the update reload watcher on confirm", () => {
		const launchAssist = vi.fn();
		const armUpdateReload = vi.fn();
		renderMenu(launchAssist, armUpdateReload);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(armUpdateReload).toHaveBeenCalledTimes(1);
	});

	it("navigates to the config page from the cog beside the menu", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Config" }));

		expect(screen.getByText("config page")).toBeTruthy();
	});

	it("does not launch when the update is cancelled", () => {
		const launchAssist = vi.fn();
		renderMenu(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Update assist"));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(launchAssist).not.toHaveBeenCalled();
	});

	it("offers a single restart item", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

		expect(screen.getAllByText("Restart daemon")).toHaveLength(1);
		expect(screen.queryByText("Restart webserver")).toBeNull();
		expect(screen.queryByText("Restart both")).toBeNull();
	});

	it("restarts the daemon and web server together on confirm", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Restart daemon"));
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(fetchMock).toHaveBeenCalledWith("/api/restart?target=both", {
			method: "POST",
		});
	});

	it("opens the keyboard shortcuts sheet from the menu", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Keyboard shortcuts"));

		const sheet = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
		expect(within(sheet).getByText("Navigate")).toBeTruthy();
		expect(within(sheet).getByText("Switch top-level tab")).toBeTruthy();
		expect(within(sheet).getByText("Alt+1–5")).toBeTruthy();
		expect(within(sheet).getByText("Ctrl+/")).toBeTruthy();
	});

	it("opens the sheet on Ctrl+/ and restores focus when Esc closes it", async () => {
		renderMenu(vi.fn());
		const terminal = document.createElement("textarea");
		document.body.append(terminal);
		terminal.focus();

		fireEvent.keyDown(terminal, { key: "/", code: "Slash", ctrlKey: true });
		const sheet = await screen.findByRole("dialog", {
			name: "Keyboard shortcuts",
		});
		fireEvent.keyDown(sheet, { key: "Escape" });

		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(document.activeElement).toBe(terminal);
		terminal.remove();
	});

	it("names the selected peer on the restart item and dialog", () => {
		renderMenu(vi.fn(), () => {}, "win");

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		expect(screen.queryByText("Restart daemon")).toBeNull();
		fireEvent.click(screen.getByText("Restart win"));

		expect(screen.getByText("Restart win?")).toBeTruthy();
	});

	it("restarts the selected peer without reloading the page", async () => {
		const reload = vi.fn();
		vi.stubGlobal("location", { reload });
		renderMenu(vi.fn(), () => {}, "win");

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Restart win"));
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/restart?target=both&node=win",
			{ method: "POST" },
		);
		await waitFor(() => expect(screen.queryByText("Restart win?")).toBeNull());
		expect(reload).not.toHaveBeenCalled();
	});

	it("updates the selected peer as a card on that node", () => {
		const launchAssist = vi.fn();
		const armUpdateReload = vi.fn();
		renderMenu(launchAssist, armUpdateReload, "win");

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		expect(screen.queryByText("Update assist")).toBeNull();
		fireEvent.click(screen.getByText("Update assist on win"));
		expect(screen.getByText("Update assist on win?")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Update" }));

		expect(launchAssist).toHaveBeenCalledWith(["update"], undefined, {
			node: "win",
		});
		expect(armUpdateReload).not.toHaveBeenCalled();
	});

	it("does not restart when the restart is cancelled", () => {
		renderMenu(vi.fn());

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		fireEvent.click(screen.getByText("Restart daemon"));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(fetchMock).not.toHaveBeenCalledWith(
			expect.stringContaining("/api/restart"),
			expect.anything(),
		);
	});
});
