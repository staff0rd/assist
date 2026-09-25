// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NewSessionDialog } from "./NewSessionDialog";
import type { NewSessionMode } from "./NewSessionDialog/newSessionModes";
import { RepoSelectionContext } from "../../../../useRepoSelectionContext";

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

function renderDialog(defaultMode: NewSessionMode = "prompt") {
	const onCreate = vi.fn();
	const onCreateAssist = vi.fn();
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
			<NewSessionDialog
				defaultMode={defaultMode}
				onCreate={onCreate}
				onCreateAssist={onCreateAssist}
				onClose={onClose}
			/>
		</RepoSelectionContext.Provider>,
	);
	return { onCreate, onCreateAssist, onClose, setSelectedCwd };
}

function repoInput() {
	return screen.getByRole("combobox", { name: "Repo" }) as HTMLInputElement;
}

function promptInput() {
	return screen.getByRole("textbox", { name: "Prompt" }) as HTMLTextAreaElement;
}

function modeRadio(name: string) {
	return screen.getByRole("radio", { name });
}

function checkedMode() {
	return screen
		.getAllByRole("radio")
		.find((radio) => radio.getAttribute("aria-checked") === "true")
		?.textContent;
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

describe("NewSessionDialog mode selector", () => {
	it("pre-selects prompt mode when it is the default", () => {
		renderDialog("prompt");

		expect(checkedMode()).toBe("prompt");
		expect(promptInput().placeholder).toBe("Enter prompt...");
		expect(screen.getByRole("button", { name: "Start session" })).toBeTruthy();
	});

	it("pre-selects the configured default mode", () => {
		renderDialog("bug");

		expect(checkedMode()).toBe("bug");
		expect(screen.getByRole("button", { name: "File bug" })).toBeTruthy();
	});

	it("switches mode with the arrow keys and wraps around", () => {
		renderDialog();

		fireEvent.keyDown(modeRadio("prompt"), { key: "ArrowRight" });
		expect(checkedMode()).toBe("draft");
		expect(document.activeElement).toBe(modeRadio("draft"));

		fireEvent.keyDown(modeRadio("draft"), { key: "ArrowLeft" });
		fireEvent.keyDown(modeRadio("prompt"), { key: "ArrowLeft" });
		expect(checkedMode()).toBe("bug");
	});

	it("updates the placeholder and submit label to follow the mode", () => {
		renderDialog();

		fireEvent.click(modeRadio("bug"));

		expect(promptInput().placeholder).toMatch(/^Describe the bug/);
		expect(screen.getByRole("button", { name: "File bug" })).toBeTruthy();
	});

	it("launches a Claude session in prompt mode", () => {
		const { onCreate, onCreateAssist } = renderDialog();

		fireEvent.change(promptInput(), { target: { value: "fix it" } });
		submitPrompt();

		expect(onCreate).toHaveBeenCalledWith("fix it", "/git/beta");
		expect(onCreateAssist).not.toHaveBeenCalled();
	});

	it.each([
		["draft", ["draft", "--once", "add a thing"]],
		["bug", ["bug", "--once", "add a thing"]],
	])("launches assist in %s mode in the chosen repo", (mode, args) => {
		const { onCreate, onCreateAssist } = renderDialog();

		fireEvent.change(promptInput(), { target: { value: "add a thing" } });
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "alpha" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });
		fireEvent.click(modeRadio(mode));
		fireEvent.keyDown(modeRadio(mode), { key: "Enter" });

		expect(onCreateAssist).toHaveBeenCalledWith(args, "/git/alpha");
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("launches assist with no prompt when the prompt is empty", () => {
		const { onCreateAssist } = renderDialog();

		fireEvent.click(modeRadio("draft"));
		submitPrompt();

		expect(onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once"],
			"/git/beta",
		);
	});
});
