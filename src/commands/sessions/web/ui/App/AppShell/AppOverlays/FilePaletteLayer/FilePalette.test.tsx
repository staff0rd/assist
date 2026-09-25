// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilePalette } from "./FilePalette";
import { RepoSelectionContext } from "../../../../useRepoSelectionContext";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubFiles(files: string[]) {
	const fetch = vi.fn().mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => ({ files }),
	});
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

function CurrentLocation() {
	const { pathname, search } = useLocation();
	return <div data-testid="location">{`${pathname}${search}`}</div>;
}

function renderPalette(onClose = vi.fn(), worktreeCwd = "/repo") {
	render(
		<MemoryRouter initialEntries={["/sessions"]}>
			<RepoSelectionContext.Provider
				value={{
					repos: [],
					selectedCwd: "/repo",
					worktreeCwd,
					setSelectedCwd: vi.fn(),
				}}
			>
				<FilePalette onClose={onClose} />
			</RepoSelectionContext.Provider>
			<CurrentLocation />
		</MemoryRouter>,
	);
	return { onClose };
}

function input() {
	return screen.getByPlaceholderText("Search files by name...");
}

describe("FilePalette", () => {
	it("focuses the search field on open", () => {
		stubFiles([]);
		renderPalette();

		expect(document.activeElement).toBe(input());
	});

	it("queries the selected repo on each keypress", async () => {
		const fetch = stubFiles(["src/useDaemonState.ts"]);
		renderPalette();

		fireEvent.change(input(), { target: { value: "uds" } });

		expect(await screen.findByText("useDaemonState.ts")).toBeTruthy();
		expect(fetch).toHaveBeenLastCalledWith("/api/files?cwd=%2Frepo&q=uds");
	});

	it("opens the highlighted file on Enter", async () => {
		stubFiles(["src/a.ts", "src/b.ts"]);
		const { onClose } = renderPalette();

		fireEvent.change(input(), { target: { value: "s" } });
		await screen.findByText("b.ts");
		fireEvent.keyDown(input(), { key: "ArrowDown" });
		fireEvent.keyDown(input(), { key: "Enter" });

		expect(screen.getByTestId("location").textContent).toBe(
			"/file?path=src%2Fb.ts&cwd=%2Frepo",
		);
		expect(onClose).toHaveBeenCalled();
	});

	it("opens the file in the active worktree, not the clone", async () => {
		stubFiles(["src/a.ts"]);
		renderPalette(vi.fn(), "/repo/.worktrees/feature");

		fireEvent.change(input(), { target: { value: "a" } });
		await screen.findByText("a.ts");
		fireEvent.keyDown(input(), { key: "Enter" });

		expect(screen.getByTestId("location").textContent).toBe(
			"/file?path=src%2Fa.ts&cwd=%2Frepo%2F.worktrees%2Ffeature",
		);
	});

	it("searches the active worktree, not the clone", async () => {
		const fetch = stubFiles([]);
		renderPalette(vi.fn(), "/repo/.worktrees/feature");

		fireEvent.change(input(), { target: { value: "a" } });

		expect(fetch).toHaveBeenLastCalledWith(
			"/api/files?cwd=%2Frepo%2F.worktrees%2Ffeature&q=a",
		);
	});

	it("closes on Escape without navigating", async () => {
		stubFiles(["src/a.ts"]);
		const { onClose } = renderPalette();

		fireEvent.change(input(), { target: { value: "a" } });
		await screen.findByText("a.ts");
		fireEvent.keyDown(input(), { key: "Escape" });

		expect(onClose).toHaveBeenCalled();
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("does not query when no repo is selected", () => {
		const fetch = stubFiles([]);
		render(
			<MemoryRouter>
				<FilePalette onClose={vi.fn()} />
			</MemoryRouter>,
		);

		expect(fetch).not.toHaveBeenCalled();
		expect(screen.getByText("Select a repo to search files.")).toBeTruthy();
	});

	it("reports when nothing matches the query", async () => {
		stubFiles([]);
		renderPalette();

		fireEvent.change(input(), { target: { value: "zzz" } });

		expect(await screen.findByText("No matching files.")).toBeTruthy();
	});

	it("reports a failed search", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 500 }),
		);
		renderPalette();

		fireEvent.change(input(), { target: { value: "a" } });

		expect(
			await screen.findByText("Couldn't search files in this repo."),
		).toBeTruthy();
	});
});
