// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { useEffect, useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NewSessionDialog } from "./NewSessionDialog";
import type { NewSessionLaunchers } from "./launchNewSession";
import type { NewSessionMode } from "./newSessionModes";
import { useNewSessionDraft } from "./useNewSessionDraft";
import type { LoadedDefaultMode } from "./useNewSessionDraft/useDefaultNewSessionMode";
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

type DefaultMode =
	| NewSessionMode
	| ((cwd: string) => NewSessionMode)
	| ((cwd: string) => LoadedDefaultMode);

function useInjectedDefault(defaultMode: DefaultMode, cwd: string) {
	if (typeof defaultMode !== "function")
		return { mode: defaultMode, harnesses: {}, pending: false };
	const loaded = defaultMode(cwd);
	return typeof loaded === "string"
		? { mode: loaded, harnesses: {}, pending: false }
		: loaded;
}

function DraftedDialog({
	defaultMode,
	launchers,
	onClose,
}: {
	defaultMode: DefaultMode;
	launchers: NewSessionLaunchers;
	onClose: () => void;
}) {
	const draft = useNewSessionDraft(0, (cwd) =>
		useInjectedDefault(defaultMode, cwd),
	);
	return (
		draft && (
			<NewSessionDialog draft={draft} launchers={launchers} onClose={onClose} />
		)
	);
}

function renderDialog(
	defaultMode: DefaultMode = "prompt",
	capabilities = { exposeCodexActions: false, exposePiActions: false },
) {
	const resolution = (available: boolean) =>
		available
			? { available: true }
			: {
					available: false,
					reasons: [
						{ capability: "harness.enabled", reason: "off", remediation: "on" },
					],
				};
	vi.stubGlobal(
		"fetch",
		vi.fn(async () =>
			Response.json({
				...capabilities,
				engine: "claude",
				features: {
					session: {
						claude: resolution(true),
						codex: resolution(capabilities.exposeCodexActions),
						pi: resolution(capabilities.exposePiActions),
					},
					design: {
						claude: resolution(true),
						codex: resolution(capabilities.exposeCodexActions),
						pi: resolution(false),
					},
				},
			}),
		),
	);
	const onCreate = vi.fn();
	const onCreateDesign = vi.fn();
	const onCreateHarness = vi.fn((harness: string, ...rest: unknown[]) => {
		if (harness === "claude") onCreate(...rest);
	});
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
				cloneOn: (cwd) => cwd,
				originOf: () => undefined,
			}}
		>
			<DraftedDialog
				defaultMode={defaultMode}
				launchers={{
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

async function renderWithHarnesses(defaultMode: DefaultMode = "prompt") {
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
	return screen.getByRole("radio", { name: new RegExp(`^${name}\\b`) });
}

function promptSegment() {
	return screen.getByRole("radio", { name: /^prompt/ });
}

const CLAUDE_MODELS = ["Default", "fable", "opus", "sonnet", "haiku"];

function harnessItem(name: string) {
	return within(screen.getByRole("menu", { name: "Harness" })).getByRole(
		"menuitemradio",
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

	it("selects the repo text on focus and leaves the list closed", () => {
		renderDialog();

		fireEvent.focus(repoInput());

		expect(repoInput().selectionStart).toBe(0);
		expect(repoInput().selectionEnd).toBe(4);
		expect(repoInput().getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryAllByRole("menuitem")).toEqual([]);
	});

	it("opens every repo on ArrowDown with the current repo highlighted", () => {
		const { onCreate } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.keyDown(repoInput(), { key: "ArrowDown" });

		expect(repoInput().getAttribute("aria-expanded")).toBe("true");
		expect(options()).toEqual(["alpha", "beta", "gamma", "delta"]);

		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
	});

	it("opens every repo on click with the current repo highlighted", () => {
		const { onCreate } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.click(repoInput());

		expect(repoInput().getAttribute("aria-expanded")).toBe("true");
		expect(options()).toEqual(["alpha", "beta", "gamma", "delta"]);

		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
	});

	it("submits on Enter while the list is closed", () => {
		const { onCreate } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
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

	it("moves the highlight with the arrows and launches in it on Enter", () => {
		const { onCreate, onClose } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.keyDown(repoInput(), { key: "ArrowDown" });
		fireEvent.keyDown(repoInput(), { key: "ArrowDown" });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/gamma");
		expect(onClose).toHaveBeenCalled();
	});

	it("accepts the filtered highlight on Tab without launching", () => {
		const { onCreate } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });

		expect(repoInput().value).toBe("alpha");
		expect(screen.queryAllByRole("menuitem")).toEqual([]);
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("launches nothing on Enter when no repo matches", () => {
		const { onCreate, onClose } = renderDialog();

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "zz" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreate).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
		expect(repoInput().value).toBe("zz");
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

		expect(checkedMode()).toBe("prompt · Claude");
		expect(promptInput().placeholder).toBe("Enter prompt...");
		expect(screen.getByRole("button", { name: "Start session" })).toBeTruthy();
	});

	it("pre-selects the configured default mode", () => {
		renderDialog("bug");

		expect(checkedMode()).toBe("bug · Claude");
		expect(screen.getByRole("button", { name: "File bug" })).toBeTruthy();
	});

	it("follows the selected repo's default mode", () => {
		renderDialog((cwd) => (cwd === "/git/alpha" ? "bug" : "prompt"));

		expect(checkedMode()).toBe("prompt · Claude");

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });

		expect(checkedMode()).toBe("bug · Claude");
	});

	function useLoadedDefault(cwd: string) {
		const [loaded, setLoaded] = useState<{
			cwd: string;
			mode: NewSessionMode;
		}>({ cwd: "/git/beta", mode: "draft" });
		useEffect(() => {
			const timer = setTimeout(() =>
				setLoaded({ cwd, mode: cwd === "/git/alpha" ? "prompt" : "draft" }),
			);
			return () => clearTimeout(timer);
		}, [cwd]);
		return { mode: loaded.mode, harnesses: {}, pending: loaded.cwd !== cwd };
	}

	it("submits an empty prompt in the new repo's prompt default after a single Enter", async () => {
		const { onCreate, onCreateAssist, onClose } =
			renderDialog(useLoadedDefault);
		await act(async () => {});

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreateAssist).not.toHaveBeenCalled();
		expect(onCreate).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve));
		});
		expect(onCreate).toHaveBeenCalledWith("", "/git/alpha");
		expect(onCreateAssist).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
	});

	it("submits a typed prompt once the new repo's prompt default loads after a single Enter", async () => {
		const { onCreate, onCreateAssist } = renderDialog(useLoadedDefault);
		await act(async () => {});

		fireEvent.change(promptInput(), { target: { value: "fix it" } });
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve));
		});
		expect(onCreate).toHaveBeenCalledWith("fix it", "/git/alpha");
		expect(onCreateAssist).not.toHaveBeenCalled();
	});

	it("submits once the new repo's default loads after a single Enter", async () => {
		const { onCreateAssist, onClose } = renderDialog(useLoadedDefault);
		await act(async () => {});

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "ga" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });
		expect(onCreateAssist).not.toHaveBeenCalled();

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve));
		});
		expect(onCreateAssist).toHaveBeenCalledWith(
			expect.arrayContaining(["draft"]),
			"/git/gamma",
		);
		expect(onClose).toHaveBeenCalled();
	});

	it("disables the form with a loading button while the new repo's default loads", async () => {
		renderDialog(useLoadedDefault);
		await act(async () => {});

		repoInput().focus();
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });

		expect(repoInput().matches(":disabled")).toBe(true);
		expect(promptInput().matches(":disabled")).toBe(true);
		expect(
			(screen.getByRole("button", { name: /start/i }) as HTMLButtonElement)
				.disabled,
		).toBe(true);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve));
		});
		expect(repoInput().matches(":disabled")).toBe(false);
		expect(
			(
				screen.getByRole("button", {
					name: "Start session",
				}) as HTMLButtonElement
			).disabled,
		).toBe(false);
		expect(document.activeElement).toBe(repoInput());
	});

	it("submits a hand-picked mode while the new repo's default loads", async () => {
		const { onCreateAssist } = renderDialog(useLoadedDefault);
		await act(async () => {});

		fireEvent.click(modeRadio("bug"));
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreateAssist).toHaveBeenCalledWith(
			["bug", "--once", "--harness", "claude", "--no-model"],
			"/git/alpha",
		);
	});

	it("moves Tab focus onto the repo's default mode once it loads", async () => {
		renderDialog(useLoadedDefault);
		await act(async () => {});

		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });
		modeRadio("draft").focus();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve));
		});

		expect(checkedMode()).toBe("prompt · Claude");
		expect(document.activeElement).toBe(promptSegment());

		fireEvent.keyDown(promptSegment(), { key: "ArrowRight" });
		expect(document.activeElement).toBe(modeRadio("design"));
	});

	it("keeps a hand-picked mode when the repo changes", () => {
		renderDialog((cwd) => (cwd === "/git/alpha" ? "bug" : "prompt"));

		fireEvent.click(modeRadio("design"));
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "al" } });
		fireEvent.keyDown(repoInput(), { key: "Tab" });

		expect(checkedMode()).toBe("design · Claude");
	});

	it("offers draft, bug, prompt and design modes", () => {
		renderDialog();

		expect(
			within(screen.getByRole("radiogroup", { name: "Mode" }))
				.getAllByRole("radio")
				.map((radio) => radio.textContent),
		).toEqual(["draft", "bug", "prompt · Claude", "design"]);
	});

	it("switches mode with the left and right arrows and wraps around", () => {
		renderDialog();

		fireEvent.keyDown(modeRadio("prompt"), { key: "ArrowRight" });
		expect(checkedMode()).toBe("design · Claude");
		expect(document.activeElement).toBe(modeRadio("design"));

		fireEvent.keyDown(modeRadio("design"), { key: "ArrowRight" });
		expect(checkedMode()).toBe("draft · Claude");

		fireEvent.keyDown(modeRadio("draft"), { key: "ArrowLeft" });
		fireEvent.keyDown(modeRadio("design"), { key: "ArrowLeft" });
		expect(checkedMode()).toBe("prompt · Claude");
	});

	it("switches to the next mode on Tab", () => {
		renderDialog("bug");

		fireEvent.keyDown(modeRadio("bug"), { key: "Tab" });
		expect(checkedMode()).toBe("prompt · Claude");
		expect(document.activeElement).toBe(modeRadio("prompt"));

		fireEvent.keyDown(modeRadio("prompt"), { key: "Tab" });
		expect(checkedMode()).toBe("design · Claude");
		expect(document.activeElement).toBe(modeRadio("design"));
	});

	it("leaves Tab on the last mode to move focus out of the group", () => {
		renderDialog("design");

		const notPrevented = fireEvent.keyDown(modeRadio("design"), {
			key: "Tab",
		});
		expect(notPrevented).toBe(true);
		expect(checkedMode()).toBe("design · Claude");
	});

	it("switches to the previous mode on Shift+Tab", () => {
		renderDialog("bug");

		fireEvent.keyDown(modeRadio("bug"), { key: "Tab", shiftKey: true });
		expect(checkedMode()).toBe("draft · Claude");
		expect(document.activeElement).toBe(modeRadio("draft"));
	});

	it("leaves Shift+Tab on the first mode to move focus out of the group", () => {
		renderDialog("draft");

		const notPrevented = fireEvent.keyDown(modeRadio("draft"), {
			key: "Tab",
			shiftKey: true,
		});
		expect(notPrevented).toBe(true);
		expect(checkedMode()).toBe("draft · Claude");
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
		[
			"draft",
			["draft", "--once", "--harness", "claude", "--no-model", "add a thing"],
		],
		[
			"bug",
			["bug", "--once", "--harness", "claude", "--no-model", "add a thing"],
		],
	])("launches assist in %s mode in the chosen repo", (mode, args) => {
		const { onCreate, onCreateAssist } = renderDialog();

		fireEvent.change(promptInput(), { target: { value: "add a thing" } });
		fireEvent.click(modeRadio(mode));
		fireEvent.focus(repoInput());
		fireEvent.change(repoInput(), { target: { value: "alpha" } });
		fireEvent.keyDown(repoInput(), { key: "Enter" });

		expect(onCreateAssist).toHaveBeenCalledWith(args, "/git/alpha");
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("launches assist with no prompt when the prompt is empty", () => {
		const { onCreateAssist } = renderDialog();

		fireEvent.click(modeRadio("draft"));
		submitPrompt();

		expect(onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/beta",
		);
	});

	it("launches a design session in design mode", () => {
		const { onCreate, onCreateDesign } = renderDialog("design");

		fireEvent.change(promptInput(), { target: { value: "a login page" } });
		submitPrompt();

		expect(onCreateDesign).toHaveBeenCalledWith(
			"claude",
			"a login page",
			"/git/beta",
		);
		expect(onCreate).not.toHaveBeenCalled();
		expect(screen.getByRole("button", { name: "Start design" })).toBeTruthy();
	});
});

describe("NewSessionDialog Shift+click auto start", () => {
	const win = globalThis as unknown as Window;

	function submitButton() {
		return screen.getByRole("button", { name: /^(Start|File)/ });
	}

	it.each([
		["draft", ["draft", "--once", "--harness", "claude", "--no-model"]],
		["bug", ["bug", "--once", "--harness", "claude", "--no-model"]],
	] as const)("launches %s with Auto start on and opens it", (mode, args) => {
		const { onCreateAssist } = renderDialog(mode);

		fireEvent.click(submitButton(), { shiftKey: true });

		expect(onCreateAssist).toHaveBeenCalledWith(args, "/git/beta", {
			autoApprove: true,
			open: true,
		});
	});

	it("launches draft with Auto start off on a plain click", () => {
		const { onCreateAssist } = renderDialog("draft");

		fireEvent.click(submitButton());

		expect(onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/beta",
		);
	});

	it("leaves Shift+Enter in the prompt as a newline", () => {
		const { onCreateAssist } = renderDialog("draft");

		fireEvent.keyDown(promptInput(), { key: "Enter", shiftKey: true });

		expect(onCreateAssist).not.toHaveBeenCalled();
	});

	it("opens a Shift+clicked prompt session without auto-starting an assist launch", () => {
		const prompt = renderDialog();
		fireEvent.click(submitButton(), { shiftKey: true });
		expect(prompt.onCreate).toHaveBeenCalledWith(
			"",
			"/git/beta",
			undefined,
			true,
		);
		expect(prompt.onCreateAssist).not.toHaveBeenCalled();
		cleanup();

		const design = renderDialog("design");
		fireEvent.click(submitButton(), { shiftKey: true });
		expect(design.onCreateDesign).toHaveBeenCalledWith(
			"claude",
			"",
			"/git/beta",
			undefined,
			true,
		);
		expect(design.onCreateAssist).not.toHaveBeenCalled();
	});

	it("shows the auto start label while Shift is held and reverts on release or blur", () => {
		renderDialog("bug");

		fireEvent.keyDown(win, { key: "Shift", shiftKey: true });
		expect(submitButton().textContent).toBe("File bug + auto start");

		fireEvent.keyUp(win, { key: "Shift", shiftKey: false });
		expect(submitButton().textContent).toBe("File bug");

		fireEvent.keyDown(win, { key: "Shift", shiftKey: true });
		fireEvent.blur(win);
		expect(submitButton().textContent).toBe("File bug");
	});

	it("keeps the prompt mode label while Shift is held", () => {
		renderDialog();

		fireEvent.keyDown(win, { key: "Shift", shiftKey: true });

		expect(submitButton().textContent).toBe("Start session");
	});
});

describe("NewSessionDialog harness selector", () => {
	it("offers only the harnesses where design mode resolves and launches the chosen one", async () => {
		const { onCreateDesign } = await renderWithHarnesses("design");
		const designSegment = () => screen.getByRole("radio", { name: /^design/ });

		expect(designSegment().textContent).toBe("design · Claude");
		fireEvent.click(designSegment());
		expect(
			within(screen.getByRole("menu", { name: "Harness" }))
				.getAllByRole("menuitemradio")
				.map((item) => item.textContent),
		).toEqual(["Claude", "Codex", ...CLAUDE_MODELS]);
		fireEvent.click(harnessItem("Codex"));
		fireEvent.change(promptInput(), { target: { value: "a login page" } });
		submitPrompt();

		expect(onCreateDesign).toHaveBeenCalledWith(
			"codex",
			"a login page",
			"/git/beta",
		);
	});

	it("keeps design mode when Codex is picked after switching to design", async () => {
		const { onCreateDesign, onCreateHarness } =
			await renderWithHarnesses("draft");
		const designSegment = () => screen.getByRole("radio", { name: /^design/ });

		fireEvent.click(designSegment());
		fireEvent.click(designSegment());
		fireEvent.click(harnessItem("Codex"));
		fireEvent.change(promptInput(), { target: { value: "a login page" } });
		submitPrompt();

		expect(onCreateHarness).not.toHaveBeenCalled();
		expect(onCreateDesign).toHaveBeenCalledWith(
			"codex",
			"a login page",
			"/git/beta",
		);
	});

	it("names Claude on the prompt segment when it is the only harness, for the model menu", async () => {
		renderDialog();
		await act(async () => {});

		expect(modeRadio("prompt").textContent).toBe("prompt · Claude");
	});

	it("names the chosen harness on the prompt segment", async () => {
		await renderWithHarnesses();

		expect(promptSegment().textContent).toBe("prompt · Claude");
	});

	it("switches to prompt without opening the menu from another mode", async () => {
		await renderWithHarnesses("bug");

		fireEvent.click(promptSegment());

		expect(checkedMode()).toBe("prompt · Claude");
		expect(screen.queryByRole("menu", { name: "Harness" })).toBeNull();
	});

	it("opens the harness menu when prompt is clicked again", async () => {
		await renderWithHarnesses();

		fireEvent.click(promptSegment());

		expect(
			within(screen.getByRole("menu", { name: "Harness" }))
				.getAllByRole("menuitemradio")
				.map((item) => item.textContent),
		).toEqual(["Claude", "Codex", "pi", ...CLAUDE_MODELS]);
		expect(harnessItem("Claude").getAttribute("aria-checked")).toBe("true");

		fireEvent.click(harnessItem("Codex"));

		expect(promptSegment().textContent).toBe("prompt · Codex");
		await waitFor(() =>
			expect(screen.queryByRole("menu", { name: "Harness" })).toBeNull(),
		);
	});

	it("opens the harness menu on ArrowDown from the prompt segment", async () => {
		await renderWithHarnesses();

		fireEvent.keyDown(promptSegment(), { key: "ArrowDown" });

		expect(screen.getByRole("menu", { name: "Harness" })).toBeTruthy();
	});

	it("launches the chosen harness on Enter from the selector", async () => {
		const { onCreate, onCreateHarness } = await renderWithHarnesses();

		fireEvent.change(promptInput(), { target: { value: "fix it" } });
		fireEvent.click(promptSegment());
		fireEvent.click(harnessItem("Codex"));
		fireEvent.keyDown(promptSegment(), { key: "Enter" });

		expect(onCreateHarness).toHaveBeenCalledWith(
			"codex",
			"fix it",
			"/git/beta",
		);
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("launches Claude by name when Claude is chosen", async () => {
		const { onCreateHarness } = await renderWithHarnesses();

		submitPrompt();

		expect(onCreateHarness).toHaveBeenCalledWith("claude", "", "/git/beta");
	});
});

describe("NewSessionDialog per-type default harness", () => {
	const configured =
		(harnesses: LoadedDefaultMode["harnesses"]) => (): LoadedDefaultMode => ({
			mode: "prompt",
			harnesses,
			pending: false,
		});
	const designSegment = () => screen.getByRole("radio", { name: /^design/ });

	it("preselects each type's configured harness as the type switches", async () => {
		await renderWithHarnesses(
			configured({ prompt: "codex", design: "claude" }),
		);

		expect(promptSegment().textContent).toBe("prompt · Codex");
		fireEvent.click(designSegment());
		expect(checkedMode()).toBe("design · Claude");
		fireEvent.click(promptSegment());
		expect(checkedMode()).toBe("prompt · Codex");
	});

	it("keeps a hand-picked harness across type switches", async () => {
		await renderWithHarnesses(
			configured({ prompt: "claude", design: "claude" }),
		);

		fireEvent.click(promptSegment());
		fireEvent.click(harnessItem("Codex"));
		fireEvent.click(designSegment());
		expect(checkedMode()).toBe("design · Codex");
		fireEvent.click(promptSegment());
		expect(checkedMode()).toBe("prompt · Codex");
	});

	it("falls back to the first available harness when the configured one is unavailable", async () => {
		const { onCreateDesign } = await renderWithHarnesses(
			configured({ prompt: "pi", design: "pi" }),
		);

		fireEvent.click(designSegment());
		expect(checkedMode()).toBe("design · Claude");
		fireEvent.change(promptInput(), { target: { value: "a page" } });
		submitPrompt();
		expect(onCreateDesign).toHaveBeenCalledWith(
			"claude",
			"a page",
			"/git/beta",
		);
	});
});

describe("NewSessionDialog per-type default model", () => {
	const configured =
		(models: LoadedDefaultMode["models"]) => (): LoadedDefaultMode => ({
			mode: "prompt",
			harnesses: { prompt: "claude", design: "claude" },
			models,
			pending: false,
		});
	const designSegment = () => screen.getByRole("radio", { name: /^design/ });

	it("preselects each type's configured model as the type switches", async () => {
		await renderWithHarnesses(configured({ prompt: "opus", design: "fable" }));

		expect(promptSegment().textContent).toBe("prompt · Claude · opus");
		fireEvent.click(designSegment());
		expect(checkedMode()).toBe("design · Claude · fable");
		fireEvent.click(promptSegment());
		expect(checkedMode()).toBe("prompt · Claude · opus");
		fireEvent.click(promptSegment());
		expect(harnessItem("opus").getAttribute("aria-checked")).toBe("true");
	});

	it("launches on a hand-picked model and keeps it across type switches", async () => {
		const { onCreateHarness } = await renderWithHarnesses(
			configured({ prompt: "opus", design: "fable" }),
		);

		fireEvent.click(promptSegment());
		fireEvent.click(harnessItem("sonnet"));
		fireEvent.click(designSegment());
		expect(checkedMode()).toBe("design · Claude · sonnet");
		fireEvent.click(promptSegment());
		submitPrompt();

		expect(onCreateHarness).toHaveBeenCalledWith(
			"claude",
			"",
			"/git/beta",
			undefined,
			false,
			"sonnet",
		);
	});

	it("passes no model when Default is picked", async () => {
		const { onCreateHarness } = await renderWithHarnesses(
			configured({ prompt: "opus" }),
		);

		fireEvent.click(promptSegment());
		fireEvent.click(harnessItem("Default"));
		expect(promptSegment().textContent).toBe("prompt · Claude");
		submitPrompt();

		expect(onCreateHarness).toHaveBeenCalledWith("claude", "", "/git/beta");
	});

	it("resets the model to Default when the harness changes away from the configured one", async () => {
		await renderWithHarnesses(configured({ prompt: "opus" }));

		fireEvent.click(promptSegment());
		fireEvent.click(harnessItem("Codex"));

		expect(promptSegment().textContent).toBe("prompt · Codex");
		fireEvent.click(promptSegment());
		expect(harnessItem("Default").getAttribute("aria-checked")).toBe("true");
	});

	it("launches draft and bug with their configured model as --model", async () => {
		const { onCreateAssist } = await renderWithHarnesses(
			(): LoadedDefaultMode => ({
				mode: "draft",
				harnesses: { draft: "claude", bug: "claude" },
				models: { draft: "fable", bug: "opus" },
				pending: false,
			}),
		);

		expect(checkedMode()).toBe("draft · Claude · fable");
		fireEvent.click(modeRadio("bug"));
		expect(checkedMode()).toBe("bug · Claude · opus");
		fireEvent.keyDown(modeRadio("bug"), { key: "Enter" });

		expect(onCreateAssist).toHaveBeenCalledWith(
			["bug", "--once", "--harness", "claude", "--model", "opus"],
			"/git/beta",
		);
	});

	it("lists a configured model outside the built-in set", async () => {
		await renderWithHarnesses(configured({ prompt: "claude-opus-5-5" }));

		fireEvent.click(promptSegment());

		expect(harnessItem("claude-opus-5-5").getAttribute("aria-checked")).toBe(
			"true",
		);
	});
});

describe("NewSessionDialog keyboard", () => {
	it("puts every control in the Tab order", async () => {
		await renderWithHarnesses();

		expect(tabStops()).toEqual([
			promptInput(),
			repoInput(),
			promptSegment(),
			screen.getByRole("button", { name: "Start session" }),
		]);
	});

	it("submits on Enter from the mode selector", () => {
		const { onCreate } = renderDialog();

		fireEvent.keyDown(modeRadio("prompt"), { key: "Enter" });

		expect(onCreate).toHaveBeenCalledWith("", "/git/beta");
	});

	it("shows a failed defaults fetch with a retry instead of loading", () => {
		const retry = vi.fn();
		renderDialog(() => ({
			mode: "prompt",
			harnesses: {},
			pending: false,
			error: "HTTP 502",
			retry,
		}));

		expect(screen.getByRole("alert").textContent).toContain("HTTP 502");
		expect(
			screen.getByRole("button", { name: "Start session" }),
		).not.toHaveProperty("disabled", true);
		fireEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(retry).toHaveBeenCalled();
	});

	it("closes on Esc without launching", () => {
		const { onClose, onCreate } = renderDialog();

		fireEvent.keyDown(promptInput(), { key: "Escape" });

		expect(onClose).toHaveBeenCalled();
		expect(onCreate).not.toHaveBeenCalled();
	});
});
