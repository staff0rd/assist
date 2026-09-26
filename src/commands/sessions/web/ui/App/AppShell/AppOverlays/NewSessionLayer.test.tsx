// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
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
	const router = createMemoryRouter(
		[
			{
				path: "*",
				element: (
					<RepoSelectionContext.Provider
						value={{
							repos: ["/git/alpha"],
							selectedCwd: "/git/alpha",
							worktreeCwd: "/git/alpha",
							setSelectedCwd: vi.fn(),
						}}
					>
						<NewSessionLayer onCreate={vi.fn()} onCreateAssist={vi.fn()} />
					</RepoSelectionContext.Provider>
				),
			},
		],
		{ initialEntries: [path] },
	);
	render(<RouterProvider router={router} />);
	return router;
}

function checkedMode() {
	return screen
		.getAllByRole("radio")
		.find((radio) => radio.getAttribute("aria-checked") === "true")
		?.textContent;
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
