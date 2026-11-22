// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../../../designSystem/createDesignTheme";
import { NodeSelectionContext } from "../../../../../../useNodeSelectionContext";
import {
	type RepoSelection,
	RepoSelectionContext,
} from "../../../../../../useRepoSelectionContext";
import { PrPreviewApproveButtons } from "./PrPreviewApproveButtons";

afterEach(cleanup);

const clones: Record<string, string> = {
	wsl: "/git/repo",
	win: String.raw`C:\git\repo`,
};

const otherClones: Record<string, string> = { wsl: "/git/other" };

const origins: Record<string, string> = {
	"/git/repo": "github.com/me/repo",
	"/git/other": "github.com/me/other",
};

const repoSelection: RepoSelection = {
	repos: ["/git/repo", "/git/other"],
	selectedCwd: "/git/repo",
	selectedNode: "win",
	worktreeCwd: "/git/repo",
	setSelectedCwd: () => {},
	cloneOn: (cwd, node) =>
		(cwd === "/git/other" ? otherClones : clones)[node ?? "wsl"],
	originOf: (cwd) => origins[cwd],
};

function shiftClickApprove() {
	fireEvent.click(screen.getByRole("button", { name: "Approve" }), {
		shiftKey: true,
	});
}

function renderButtons(
	names: string[],
	startOrigin?: string,
	onApprove: () => void = () => {},
	canStart = true,
) {
	const onApproveAndStart = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<NodeSelectionContext.Provider
				value={{
					nodes: {
						local: "wsl",
						links: names
							.filter((name) => name !== "wsl")
							.map((name) => ({
								name,
								url: `http://${name}:3100`,
								state: "connected",
							})),
					},
					names,
					visible: names.length > 1,
					selected: "wsl",
					select: () => {},
				}}
			>
				<RepoSelectionContext.Provider value={repoSelection}>
					<PrPreviewApproveButtons
						canStart={canStart}
						startOrigin={startOrigin}
						cwd="/git/repo"
						onApprove={onApprove}
						onApproveAndStart={onApproveAndStart}
					/>
				</RepoSelectionContext.Provider>
			</NodeSelectionContext.Provider>
		</ThemeProvider>,
	);
	return onApproveAndStart;
}

function menuItem(node: string): HTMLElement {
	const item = screen
		.getAllByRole("menuitem")
		.find((element) => element.textContent?.startsWith(node));
	if (!item) throw new Error(`no menu item for ${node}`);
	return item;
}

describe("PrPreviewApproveButtons node picker", () => {
	it("defaults to the top nav node and starts the run there", () => {
		const onApproveAndStart = renderButtons(["wsl", "win"]);

		expect(
			screen.getByRole("button", { name: "Start on node" }),
		).toHaveProperty("textContent", "win");
		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith({
			node: "win",
			cwd: String.raw`C:\git\repo`,
		});
	});

	it("starts on another picked node in its clone", () => {
		const onApproveAndStart = renderButtons(["wsl", "win"]);

		fireEvent.click(screen.getByRole("button", { name: "Start on node" }));
		fireEvent.click(menuItem("wsl"));
		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith({
			node: "wsl",
			cwd: "/git/repo",
		});
	});

	it("disables a node with no clone of the repo", () => {
		renderButtons(["wsl", "win", "mac"]);

		fireEvent.click(screen.getByRole("button", { name: "Start on node" }));
		const mac = menuItem("mac");

		expect(mac.getAttribute("aria-disabled")).toBe("true");
		expect(mac.textContent).toContain("no clone");
	});

	it("starts an item from another repo in that repo's clone", () => {
		const onApproveAndStart = renderButtons(
			["wsl", "win"],
			"github.com/me/other",
		);

		expect(
			screen.getByRole("button", { name: "Start on node" }),
		).toHaveProperty("textContent", "wsl");
		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith({
			node: "wsl",
			cwd: "/git/other",
		});
	});

	it("offers nodes by their clone of the item's repo", () => {
		renderButtons(["wsl", "win"], "github.com/me/other");

		fireEvent.click(screen.getByRole("button", { name: "Start on node" }));

		expect(menuItem("win").getAttribute("aria-disabled")).toBe("true");
		expect(menuItem("wsl").getAttribute("aria-disabled")).toBeNull();
	});

	it("starts an item from the session's own repo on the picked node", () => {
		const onApproveAndStart = renderButtons(
			["wsl", "win"],
			"github.com/me/repo",
		);

		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith({
			node: "win",
			cwd: String.raw`C:\git\repo`,
		});
	});

	it("sends no node when no clone of the item's repo is known", () => {
		const onApproveAndStart = renderButtons(
			["wsl", "win"],
			"github.com/me/unknown",
		);

		expect(screen.queryByRole("button", { name: "Start on node" })).toBeNull();
		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith(undefined);
	});

	it("shows no picker and sends no node with a single node", () => {
		const onApproveAndStart = renderButtons(["wsl"]);

		expect(screen.queryByRole("button", { name: "Start on node" })).toBeNull();
		shiftClickApprove();

		expect(onApproveAndStart).toHaveBeenCalledWith(undefined);
	});
});

describe("PrPreviewApproveButtons modifiers", () => {
	it("shows a single Approve button", () => {
		renderButtons(["wsl"]);

		expect(
			screen.getAllByRole("button").map((button) => button.textContent),
		).toEqual(["Approve"]);
	});

	it("relabels to Approve + start while Shift is held", () => {
		renderButtons(["wsl"]);

		act(() => {
			fireEvent.keyDown(globalThis.window, { key: "Shift", shiftKey: true });
		});
		expect(
			screen.getByRole("button", { name: "Approve + start" }),
		).toBeTruthy();

		act(() => {
			fireEvent.keyUp(globalThis.window, { key: "Shift", shiftKey: false });
		});
		expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
	});

	it.each([
		["a plain click", {}],
		["a Ctrl-only click", { ctrlKey: true }],
	])("approves without starting on %s", (_name, modifiers) => {
		const onApprove = vi.fn();
		const onApproveAndStart = renderButtons(["wsl"], undefined, onApprove);

		fireEvent.click(screen.getByRole("button", { name: "Approve" }), modifiers);

		expect(onApprove).toHaveBeenCalledOnce();
		expect(onApproveAndStart).not.toHaveBeenCalled();
	});

	it("describes the Shift shortcut in its tooltip", async () => {
		renderButtons(["wsl"]);

		fireEvent.mouseOver(screen.getByRole("button", { name: "Approve" }));

		expect((await screen.findByRole("tooltip")).textContent).toContain(
			"Shift+click: Approve + start",
		);
	});

	it("is a plain Approve that ignores Shift when the item cannot start", () => {
		const onApprove = vi.fn();
		const onApproveAndStart = renderButtons(
			["wsl", "win"],
			undefined,
			onApprove,
			false,
		);

		act(() => {
			fireEvent.keyDown(globalThis.window, { key: "Shift", shiftKey: true });
		});
		expect(screen.queryByRole("button", { name: "Start on node" })).toBeNull();
		shiftClickApprove();

		expect(onApprove).toHaveBeenCalledOnce();
		expect(onApproveAndStart).not.toHaveBeenCalled();
	});
});
