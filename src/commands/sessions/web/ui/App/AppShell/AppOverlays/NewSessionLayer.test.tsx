// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NewSessionLayer } from "./NewSessionLayer";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function renderAt(path: string) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => Response.json({ mode: "bug" })),
	);
	const onCreate = vi.fn();
	const onCreateAssist = vi.fn();
	const router = createMemoryRouter(
		[
			{
				path: "*",
				element: (
					<RepoSelectionContext.Provider
						value={{
							repos: ["/git/alpha", "/git/beta"],
							selectedCwd: "/git/alpha",
							worktreeCwd: "/git/alpha",
							setSelectedCwd: vi.fn(),
						}}
					>
						<NewSessionLayer
							onCreate={onCreate}
							onCreateAssist={onCreateAssist}
						/>
					</RepoSelectionContext.Provider>
				),
			},
		],
		{ initialEntries: [path] },
	);
	render(<RouterProvider router={router} />);
	return Object.assign(router, { onCreate, onCreateAssist });
}

function checkedMode() {
	return screen
		.getAllByRole("radio")
		.find((radio) => radio.getAttribute("aria-checked") === "true")
		?.textContent;
}

function promptInput() {
	return screen.getByRole("textbox", { name: "Prompt" }) as HTMLTextAreaElement;
}

function repoInput() {
	return screen.getByRole("combobox", { name: "Repo" }) as HTMLInputElement;
}

async function openDialog() {
	await act(async () => {});
	fireEvent.keyDown(document, { key: "n", ctrlKey: true });
}

function fillDraft() {
	fireEvent.change(promptInput(), { target: { value: "add a thing" } });
	fireEvent.focus(repoInput());
	fireEvent.change(repoInput(), { target: { value: "beta" } });
	fireEvent.keyDown(repoInput(), { key: "Enter" });
	fireEvent.click(screen.getByRole("radio", { name: "draft" }));
}

describe("NewSessionLayer ?new", () => {
	it("opens the dialog in the default mode when mounted at ?new", async () => {
		renderAt("/?new");

		expect(await screen.findByRole("textbox", { name: "Prompt" })).toBeTruthy();
		expect(checkedMode()).toBe("bug");
	});

	it("strips the new param with a replace", async () => {
		const router = renderAt("/sessions?new&keep=1");

		await screen.findByRole("textbox", { name: "Prompt" });
		expect(router.state.location.pathname).toBe("/sessions");
		expect(router.state.location.search).toBe("?keep=1");
		expect(router.state.historyAction).toBe("REPLACE");
	});

	it("stays closed without the new param", async () => {
		renderAt("/sessions");

		await act(async () => {});
		expect(screen.queryByRole("textbox", { name: "Prompt" })).toBeNull();
	});

	it("opens after navigating to ?new from another route", async () => {
		const router = renderAt("/sessions");
		await act(async () => {});
		expect(screen.queryByRole("textbox", { name: "Prompt" })).toBeNull();

		await act(() => router.navigate("/?new"));

		expect(await screen.findByRole("textbox", { name: "Prompt" })).toBeTruthy();
		expect(router.state.location.search).toBe("");
	});
});

describe("NewSessionLayer draft", { timeout: 20_000 }, () => {
	it("restores the prompt, repo and mode after the dialog is dismissed", async () => {
		renderAt("/sessions");

		await openDialog();
		fillDraft();
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		expect(screen.queryByRole("dialog")).toBeNull();

		await openDialog();
		expect(promptInput().value).toBe("add a thing");
		expect(repoInput().value).toBe("beta");
		expect(checkedMode()).toBe("draft");
	});

	it("starts fresh on the selected repo after a session is launched", async () => {
		const { onCreateAssist } = renderAt("/sessions");

		await openDialog();
		fillDraft();
		fireEvent.keyDown(promptInput(), { key: "Enter" });
		expect(onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once", "add a thing"],
			"/git/beta",
		);

		await openDialog();
		expect(promptInput().value).toBe("");
		expect(repoInput().value).toBe("alpha");
		expect(checkedMode()).toBe("bug");
	});
});
