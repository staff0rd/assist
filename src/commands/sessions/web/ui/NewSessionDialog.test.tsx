// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NewSessionDialog } from "./NewSessionDialog";
import { RepoSelectionContext } from "./useRepoSelectionContext";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

const repos = [
	"/git/alpha",
	"/git/beta",
	"/git/gamma",
	String.raw`C:\git\delta`,
];

function renderDialog() {
	const onCreate = vi.fn();
	const onClose = vi.fn();
	const setSelectedCwd = vi.fn();
	render(
		<RepoSelectionContext.Provider
			value={{
				repos,
				selectedCwd: "/git/beta",
				worktreeCwd: "/git/beta",
				setSelectedCwd,
			}}
		>
			<NewSessionDialog onCreate={onCreate} onClose={onClose} />
		</RepoSelectionContext.Provider>,
	);
	return { onCreate, onClose, setSelectedCwd };
}

function repoInput() {
	return screen.getByRole("combobox", { name: "Repo" }) as HTMLInputElement;
}

function promptInput() {
	return screen.getByPlaceholderText("What should Claude do?");
}

function options() {
	return screen.getAllByRole("menuitem").map((item) => item.textContent);
}

function submitPrompt() {
	fireEvent.keyDown(promptInput(), { key: "Enter" });
}

describe("NewSessionDialog repo combobox", () => {
	it("defaults to the current repo", () => {
		renderDialog();

		expect(repoInput().value).toBe("beta");
	});

	it("selects the repo text on focus and lists every repo", () => {
		renderDialog();

		fireEvent.focus(repoInput());

		expect(repoInput().selectionStart).toBe(0);
		expect(repoInput().selectionEnd).toBe(4);
		expect(options()).toEqual(["alpha", "beta", "gamma", "delta"]);
	});

	it("filters the list by repo name as you type", () => {
		renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "ma" } });

		expect(options()).toEqual(["gamma"]);
	});

	it("does not match on the parent path", () => {
		renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "git" } });

		expect(screen.queryAllByRole("menuitem")).toEqual([]);
	});

	it("moves the highlight with the arrows and accepts it on Enter", () => {
		const { onCreate } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.keyDown(repoInput(), { key: "ArrowDown" });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(repoInput().value).toBe("gamma");
		expect(screen.queryAllByRole("menuitem")).toEqual([]);
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("accepts the filtered highlight on Tab", () => {
		renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });

		expect(repoInput().value).toBe("alpha");
	});

	it("restores the chosen repo name when focus leaves mid-filter", () => {
		renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "zz" } });
		fireEvent.blur(repoInput());

		expect(repoInput().value).toBe("beta");
	});

	it("launches in the chosen repo without changing the toolbar's repo", () => {
		const { onCreate, onClose, setSelectedCwd } = renderDialog();

		fireEvent.change(promptInput(), { target: { value: "fix it" } });
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "delta" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });
		submitPrompt();

		expect(onCreate).toHaveBeenCalledWith("fix it", String.raw`C:\git\delta`);
		expect(onClose).toHaveBeenCalled();
		expect(setSelectedCwd).not.toHaveBeenCalled();
	});

	it("launches in the current repo when the repo is left alone", () => {
		const { onCreate } = renderDialog();

		submitPrompt();

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
	});
});
