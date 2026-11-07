// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { NodeSelectionContext } from "../useNodeSelectionContext";
import {
	type RepoSelection,
	RepoSelectionContext,
} from "../useRepoSelectionContext";
import { PhoneSessionPreview } from "./PhoneSessionPreview";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

const backlogItem: PrPreview = {
	requestId: "r1",
	title: "Backlog-item previews show question status",
	body: "**Type:** story\n\n## Description\n\nA pending preview looks like an idle prompt.\n\n## Plan\n\nPhase 1",
	prNumber: null,
	kind: "backlog-item",
	itemType: "story",
	canStart: true,
};

function renderPreview(preview: PrPreview) {
	const onDecision = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneSessionPreview
				preview={preview}
				session={makeSessionInfo({ id: "s1" })}
				keyboardOpen={false}
				sendInput={vi.fn()}
				onDecision={onDecision}
			/>
		</ThemeProvider>,
	);
	return onDecision;
}

const card = () => within(screen.getByTestId("phone-preview-card"));
const sheet = () => within(screen.getByTestId("phone-review-sheet"));

describe("PhoneSessionPreview", () => {
	it("shows the kind, title and summary of a backlog item", () => {
		renderPreview(backlogItem);
		expect(card().getByText("Backlog item · story")).toBeTruthy();
		expect(
			card().getByText("Backlog-item previews show question status"),
		).toBeTruthy();
		expect(
			card().getByText("A pending preview looks like an idle prompt."),
		).toBeTruthy();
	});

	it.each([
		["Approve", "approve", undefined],
		["Approve & start", "approve", true],
		["Reject", "reject", undefined],
	])("sends %s from the card", (name, decision, autostart) => {
		const onDecision = renderPreview(backlogItem);
		fireEvent.click(card().getByRole("button", { name }));
		expect(onDecision).toHaveBeenCalledOnce();
		const [sent, details] = onDecision.mock.calls[0] ?? [];
		expect(sent).toBe(decision);
		expect(details.autostart).toBe(autostart);
		expect(details.comments).toEqual([]);
	});

	it("offers Approve & start only when the item can start", () => {
		renderPreview({ ...backlogItem, canStart: false });
		expect(card().queryByRole("button", { name: "Approve & start" })).toBe(
			null,
		);
		renderPreview({ ...backlogItem, kind: "pr", requestId: "r2" });
		expect(
			screen.getAllByTestId("phone-preview-card")[1]?.textContent,
		).not.toContain("Approve & start");
	});

	it("opens the review sheet with the rendered body and rejects with a reason", () => {
		const onDecision = renderPreview(backlogItem);
		fireEvent.click(card().getByRole("button", { name: "Review full item" }));
		expect(sheet().getByRole("heading", { name: "Description" })).toBeTruthy();

		fireEvent.change(sheet().getByPlaceholderText("Optional"), {
			target: { value: "  Split it up  " },
		});
		fireEvent.click(sheet().getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ reason: "Split it up", comments: [] }),
		);
	});

	it("approves and starts from the sheet", () => {
		const onDecision = renderPreview(backlogItem);
		fireEvent.click(card().getByRole("button", { name: "Review full item" }));
		fireEvent.click(sheet().getByRole("button", { name: "Approve & start" }));
		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ autostart: true }),
		);
		expect(onDecision.mock.calls[0]?.[1].reason).toBeUndefined();
	});

	it("shows no node picker with a single node", () => {
		renderPreview(backlogItem);
		expect(card().queryByRole("button", { name: "Start on node" })).toBe(null);
	});

	it("gives show previews only Close", () => {
		const onDecision = renderPreview({
			requestId: "r3",
			title: "Links",
			body: "Some text",
			prNumber: null,
			kind: "show",
		});
		expect(card().queryByRole("button", { name: "Approve" })).toBe(null);
		expect(card().queryByRole("button", { name: "Reject" })).toBe(null);
		fireEvent.click(card().getByRole("button", { name: "Close" }));
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ comments: [] }),
		);
	});

	it("reviews a miro-board preview in its own pane", () => {
		renderPreview({
			requestId: "r4",
			title: "Pick boxes",
			body: JSON.stringify({ boxes: [] }),
			prNumber: null,
			kind: "miro-board",
		});
		expect(card().queryByRole("button", { name: "Approve" })).toBe(null);
		fireEvent.click(card().getByRole("button", { name: "Review" }));
		expect(sheet().getByRole("button", { name: "Extract boxes" })).toBeTruthy();
	});
});

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

function renderOnNodes(names: string[]) {
	const onDecision = vi.fn();
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
					<PhoneSessionPreview
						preview={backlogItem}
						session={makeSessionInfo({ id: "s1", cwd: "/git/repo" })}
						keyboardOpen={false}
						sendInput={vi.fn()}
						onDecision={onDecision}
					/>
				</RepoSelectionContext.Provider>
			</NodeSelectionContext.Provider>
		</ThemeProvider>,
	);
	return onDecision;
}

function menuItem(node: string): HTMLElement {
	const item = screen
		.getAllByRole("menuitem")
		.find((element) => element.textContent?.startsWith(node));
	if (!item) throw new Error(`no menu item for ${node}`);
	return item;
}

describe("PhoneSessionPreview node picker", () => {
	it("defaults to the top nav node and starts the run there", () => {
		const onDecision = renderOnNodes(["wsl", "win"]);

		expect(
			card().getByRole("button", { name: "Start on node" }).textContent,
		).toBe("win");
		fireEvent.click(card().getByRole("button", { name: "Approve & start" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				autostart: true,
				startOn: { node: "win", cwd: String.raw`C:\git\repo` },
			}),
		);
	});

	it("starts on another node picked in the sheet, in its clone", () => {
		const onDecision = renderOnNodes(["wsl", "win"]);

		fireEvent.click(card().getByRole("button", { name: "Review full item" }));
		fireEvent.click(sheet().getByRole("button", { name: "Start on node" }));
		fireEvent.click(menuItem("wsl"));
		fireEvent.click(sheet().getByRole("button", { name: "Approve & start" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				autostart: true,
				startOn: { node: "wsl", cwd: "/git/repo" },
			}),
		);
	});

	it("disables a node with no clone of the repo", () => {
		renderOnNodes(["wsl", "win", "mac"]);

		fireEvent.click(card().getByRole("button", { name: "Start on node" }));
		const mac = menuItem("mac");

		expect(mac.getAttribute("aria-disabled")).toBe("true");
		expect(mac.textContent).toContain("no clone");
	});

	it("sends no node on plain Approve", () => {
		const onDecision = renderOnNodes(["wsl", "win"]);

		fireEvent.click(card().getByRole("button", { name: "Approve" }));

		const details = onDecision.mock.calls[0]?.[1];
		expect(details.autostart).toBeUndefined();
		expect(details.startOn).toBeUndefined();
	});
});
