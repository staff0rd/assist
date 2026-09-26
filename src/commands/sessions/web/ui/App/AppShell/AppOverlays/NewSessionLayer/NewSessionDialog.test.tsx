// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NewSessionDialog } from "./NewSessionDialog";
import type { NewSessionLaunchers } from "./NewSessionDialog/launchNewSession";
import type { NewSessionMode } from "./NewSessionDialog/newSessionModes";
import { useNewSessionDraft } from "./useNewSessionDraft";
import { RepoSelectionContext } from "../../../../useRepoSelectionContext";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const repos = [
	"/git/alpha",
	"/git/beta",
	"/git/gamma",
	String.raw`C:\git\delta`,
];

function DraftedDialog({
	defaultMode,
	launchers,
	onClose,
}: {
	defaultMode: NewSessionMode;
	launchers: NewSessionLaunchers;
	onClose: () => void;
}) {
	const draft = useNewSessionDraft(defaultMode);
	return (
		draft && (
			<NewSessionDialog draft={draft} launchers={launchers} onClose={onClose} />
		)
	);
}

function renderDialog(
	defaultMode: NewSessionMode = "prompt",
	capabilities = { exposeCodexActions: false, exposePiActions: false },
) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => Response.json(capabilities)),
	);
	const onCreate = vi.fn();
	const onCreateDesign = vi.fn();
	const onCreateHarness = vi.fn();
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
			<DraftedDialog
				defaultMode={defaultMode}
				launchers={{
					onCreate,
					onCreateDesign,
					onCreateHarness,
					onCreateAssist,
				}}
				onClose={onClose}
			/>
		</RepoSelectionContext.Provider>,
	);
	return {
		onCreate,
		onCreateDesign,
		onCreateHarness,
		onCreateAssist,
		onClose,
		setSelectedCwd,
	};
}

async function renderWithHarnesses(defaultMode: NewSessionMode = "prompt") {
	const handlers = renderDialog(defaultMode, {
		exposeCodexActions: true,
		exposePiActions: true,
	});
	await act(async () => {});
	return handlers;
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

function harnessRadio(name: string) {
	return within(screen.getByRole("radiogroup", { name: "Harness" })).getByRole(
		"radio",
		{ name },
	);
}

function checkedIn(group: string) {
	return within(screen.getByRole("radiogroup", { name: group }))
		.getAllByRole("radio")
		.find((radio) => radio.getAttribute("aria-checked") === "true")
		?.textContent;
}

function checkedMode() {
	return checkedIn("Mode");
}

function tabStops() {
	return Array.from(
		screen
			.getByRole("dialog")
			.querySelectorAll<HTMLElement>("input, textarea, button, [tabindex]"),
	).filter((el) => el.tabIndex >= 0 && !el.hasAttribute("disabled"));
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

	it("offers draft, bug, prompt and design modes", () => {
		renderDialog();

		expect(
			within(screen.getByRole("radiogroup", { name: "Mode" }))
				.getAllByRole("radio")
				.map((radio) => radio.textContent),
		).toEqual(["draft", "bug", "prompt", "design"]);
	});

	it("switches mode with the arrow keys and wraps around", () => {
		renderDialog();

		fireEvent.keyDown(modeRadio("prompt"), { key: "ArrowRight" });
		expect(checkedMode()).toBe("design");
		expect(document.activeElement).toBe(modeRadio("design"));

		fireEvent.keyDown(modeRadio("design"), { key: "ArrowDown" });
		expect(checkedMode()).toBe("draft");

		fireEvent.keyDown(modeRadio("draft"), { key: "ArrowLeft" });
		fireEvent.keyDown(modeRadio("design"), { key: "ArrowUp" });
		expect(checkedMode()).toBe("prompt");
	});

	it("switches to the next mode on Tab", () => {
		renderDialog("bug");

		fireEvent.keyDown(modeRadio("bug"), { key: "Tab" });
		expect(checkedMode()).toBe("prompt");
		expect(document.activeElement).toBe(modeRadio("prompt"));

		fireEvent.keyDown(modeRadio("prompt"), { key: "Tab" });
		expect(checkedMode()).toBe("design");
		expect(document.activeElement).toBe(modeRadio("design"));
	});

	it("leaves Tab on the last mode to move focus out of the group", () => {
		renderDialog("design");

		const notPrevented = fireEvent.keyDown(modeRadio("design"), {
			key: "Tab",
		});
		expect(notPrevented).toBe(true);
		expect(checkedMode()).toBe("design");
	});

	it("switches to the previous mode on Shift+Tab", () => {
		renderDialog("bug");

		fireEvent.keyDown(modeRadio("bug"), { key: "Tab", shiftKey: true });
		expect(checkedMode()).toBe("draft");
		expect(document.activeElement).toBe(modeRadio("draft"));
	});

	it("leaves Shift+Tab on the first mode to move focus out of the group", () => {
		renderDialog("draft");

		const notPrevented = fireEvent.keyDown(modeRadio("draft"), {
			key: "Tab",
			shiftKey: true,
		});
		expect(notPrevented).toBe(true);
		expect(checkedMode()).toBe("draft");
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

	it("launches a design session in design mode", () => {
		const { onCreate, onCreateDesign } = renderDialog("design");

		fireEvent.change(promptInput(), { target: { value: "a login page" } });
		submitPrompt();

		expect(onCreateDesign).toHaveBeenCalledWith("a login page", "/git/beta");
		expect(onCreate).not.toHaveBeenCalled();
		expect(screen.getByRole("button", { name: "Start design" })).toBeTruthy();
	});
});

describe("NewSessionDialog harness selector", () => {
	it("is hidden when Claude is the only harness", async () => {
		renderDialog();
		await act(async () => {});

		expect(screen.queryByRole("radiogroup", { name: "Harness" })).toBeNull();
	});

	it("offers every exposed harness in prompt mode, Claude checked", async () => {
		await renderWithHarnesses();

		expect(checkedIn("Harness")).toBe("Claude");
		expect(harnessRadio("Codex")).toBeTruthy();
		expect(harnessRadio("pi")).toBeTruthy();
	});

	it.each(["draft", "bug", "design"] as const)(
		"is hidden in %s mode",
		async (mode) => {
			await renderWithHarnesses(mode);

			expect(screen.queryByRole("radiogroup", { name: "Harness" })).toBeNull();
		},
	);

	it("switches harness with the arrow keys", async () => {
		await renderWithHarnesses();

		fireEvent.keyDown(harnessRadio("Claude"), { key: "ArrowRight" });
		expect(checkedIn("Harness")).toBe("Codex");
		expect(document.activeElement).toBe(harnessRadio("Codex"));

		fireEvent.keyDown(harnessRadio("Codex"), { key: "ArrowLeft" });
		fireEvent.keyDown(harnessRadio("Claude"), { key: "ArrowLeft" });
		expect(checkedIn("Harness")).toBe("pi");
	});

	it("launches the chosen harness on Enter from the selector", async () => {
		const { onCreate, onCreateHarness } = await renderWithHarnesses();

		fireEvent.change(promptInput(), { target: { value: "fix it" } });
		fireEvent.click(harnessRadio("Codex"));
		fireEvent.keyDown(harnessRadio("Codex"), { key: "Enter" });

		expect(onCreateHarness).toHaveBeenCalledWith(
			"codex",
			"fix it",
			"/git/beta",
		);
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("launches Claude directly when Claude is chosen", async () => {
		const { onCreate, onCreateHarness } = await renderWithHarnesses();

		submitPrompt();

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
		expect(onCreateHarness).not.toHaveBeenCalled();
	});
});

describe("NewSessionDialog keyboard", () => {
	it("puts every control in the Tab order", async () => {
		await renderWithHarnesses();

		expect(tabStops()).toEqual([
			promptInput(),
			repoInput(),
			modeRadio("prompt"),
			harnessRadio("Claude"),
			screen.getByRole("button", { name: "Start session" }),
		]);
	});

	it("leaves Tab on the last harness to move focus on to submit", async () => {
		await renderWithHarnesses();
		fireEvent.click(harnessRadio("pi"));

		const notPrevented = fireEvent.keyDown(harnessRadio("pi"), { key: "Tab" });
		expect(notPrevented).toBe(true);
		expect(checkedIn("Harness")).toBe("pi");
	});

	it("submits on Enter from the mode selector", () => {
		const { onCreate } = renderDialog();

		fireEvent.keyDown(modeRadio("prompt"), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
	});

	it("closes on Esc without launching", () => {
		const { onClose, onCreate } = renderDialog();

		fireEvent.keyDown(promptInput(), { key: "Escape" });

		expect(onClose).toHaveBeenCalled();
		expect(onCreate).not.toHaveBeenCalled();
	});
});
