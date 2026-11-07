// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

const repoSelection: RepoSelection = {
	repos: ["/git/repo"],
	selectedCwd: "/git/repo",
	selectedNode: "win",
	worktreeCwd: "/git/repo",
	setSelectedCwd: () => {},
	cloneOn: (_cwd, node) => clones[node ?? "wsl"],
	originOf: (cwd) => (cwd === "/git/repo" ? "github.com/me/repo" : undefined),
};

function renderButtons(names: string[]) {
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
						canStart
						cwd="/git/repo"
						onApprove={() => {}}
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
		fireEvent.click(screen.getByRole("button", { name: "Approve & start" }));

		expect(onApproveAndStart).toHaveBeenCalledWith({
			node: "win",
			cwd: String.raw`C:\git\repo`,
		});
	});

	it("starts on another picked node in its clone", () => {
		const onApproveAndStart = renderButtons(["wsl", "win"]);

		fireEvent.click(screen.getByRole("button", { name: "Start on node" }));
		fireEvent.click(menuItem("wsl"));
		fireEvent.click(screen.getByRole("button", { name: "Approve & start" }));

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

	it("shows no picker and sends no node with a single node", () => {
		const onApproveAndStart = renderButtons(["wsl"]);

		expect(screen.queryByRole("button", { name: "Start on node" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Approve & start" }));

		expect(onApproveAndStart).toHaveBeenCalledWith(undefined);
	});
});
