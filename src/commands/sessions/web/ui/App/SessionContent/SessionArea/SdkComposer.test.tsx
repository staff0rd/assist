// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { bracketedPaste } from "../../../../../shared/pasteAndSubmit/bracketedPaste";
import type { SessionInfo } from "../../../types";
import { SdkComposer } from "./SdkComposer";
import { RunShellCommandContext } from "./TranscriptArea/useRunShellCommand";

vi.mock("../../../slashSuggestions/useSlashCommands", () => ({
	useSlashCommands: (cwd: string | undefined) =>
		cwd
			? [
					{ name: "draft", scope: "user" },
					{ name: "dream", scope: "project" },
				]
			: [],
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	localStorage.clear();
});

function setup(
	overrides: Partial<SessionInfo> = {},
	initial = "run the tests",
) {
	const sendInput = vi.fn();
	const interruptSession = vi.fn();
	render(
		<SdkComposer
			session={makeSessionInfo({ sdk: true, cwd: "/repo", ...overrides })}
			sendInput={sendInput}
			interruptSession={interruptSession}
		/>,
	);
	const field = screen.getByLabelText(/^Message /);
	type(field, initial);
	return { field, sendInput, interruptSession };
}

function type(field: HTMLElement, value: string) {
	fireEvent.change(field, {
		target: { value, selectionStart: value.length, selectionEnd: value.length },
	});
}

const value = (field: HTMLElement) => (field as HTMLTextAreaElement).value;

const highlighted = () =>
	screen
		.getAllByRole("option")
		.find((o) => o.getAttribute("aria-selected") === "true")?.textContent;

describe("SdkComposer", () => {
	it("focuses the field when shown", () => {
		const { field } = setup({ status: "waiting" });
		expect(document.activeElement).toBe(field);
	});

	it("does not focus the field while resuming", () => {
		const { field } = setup({ status: "waiting", sdkResuming: true });
		expect(document.activeElement).not.toBe(field);
	});

	it("sends on Enter as one pasted message", () => {
		const { field, sendInput } = setup({ status: "waiting" });
		fireEvent.keyDown(field, { key: "Enter" });
		expect(sendInput).toHaveBeenCalledWith(
			"1",
			bracketedPaste("run the tests"),
		);
	});

	describe("draft", () => {
		const remount = (id: string) => {
			cleanup();
			render(
				<SdkComposer
					session={makeSessionInfo({ id, sdk: true, status: "waiting" })}
					sendInput={vi.fn()}
					interruptSession={vi.fn()}
				/>,
			);
			return screen.getByLabelText("Message Claude");
		};

		it("restores the unsent draft after a remount", () => {
			setup({ status: "waiting" }, "half-typed message");
			expect(value(remount("1"))).toBe("half-typed message");
		});

		it("keeps drafts separate per session", () => {
			setup({ status: "waiting" }, "half-typed message");
			expect(value(remount("2"))).toBe("");
		});

		it("clears the saved draft once sent", () => {
			const { field } = setup({ status: "waiting" });
			fireEvent.keyDown(field, { key: "Enter" });
			expect(value(remount("1"))).toBe("");
		});
	});

	describe("backslash Enter", () => {
		const place = (field: HTMLElement, start: number, end = start) =>
			(field as HTMLTextAreaElement).setSelectionRange(start, end);
		const caret = (field: HTMLElement) =>
			(field as HTMLTextAreaElement).selectionStart;

		it("turns a trailing backslash into a line break without sending", () => {
			const { field, sendInput } = setup({ status: "waiting" }, "foo\\");
			place(field, 4);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(value(field)).toBe("foo\n");
			expect(caret(field)).toBe(4);
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("splits mid-text at the cursor after a backslash", () => {
			const { field, sendInput } = setup(
				{ status: "waiting" },
				String.raw`foo\bar`,
			);
			place(field, 4);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(value(field)).toBe("foo\nbar");
			expect(caret(field)).toBe(4);
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("sends when the cursor is not after a backslash", () => {
			const { field, sendInput } = setup(
				{ status: "waiting" },
				String.raw`foo\bar`,
			);
			place(field, 7);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith(
				"1",
				bracketedPaste(String.raw`foo\bar`),
			);
		});

		it("sends as before with a range selected", () => {
			const { field, sendInput } = setup({ status: "waiting" }, "foo\\");
			place(field, 0, 4);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith("1", bracketedPaste("foo\\"));
		});
	});

	it("stays locked while the conversation resumes", () => {
		const { field, sendInput } = setup({
			status: "waiting",
			sdkResuming: true,
		});
		expect((field as HTMLTextAreaElement).disabled).toBe(true);
		expect(field.getAttribute("placeholder")).toBe("Resuming conversation…");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("keeps Shift+Enter for a new line", () => {
		const { field, sendInput } = setup({ status: "waiting" });
		fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("hides Stop while waiting", () => {
		setup({ status: "waiting" });
		expect(screen.queryByLabelText("Stop turn")).toBeNull();
	});

	it("stops the turn from Stop or Esc while running", () => {
		const { field, interruptSession } = setup({ status: "running" });
		fireEvent.keyDown(field, { key: "Escape" });
		fireEvent.click(screen.getByLabelText("Stop turn"));
		expect(interruptSession).toHaveBeenCalledTimes(2);
	});

	it("disables Stop until the interrupt lands", () => {
		const { field, interruptSession } = setup({
			status: "running",
			sdkInterrupting: true,
		});
		fireEvent.keyDown(field, { key: "Escape" });
		expect(
			(screen.getByLabelText("Stop turn") as HTMLButtonElement).disabled,
		).toBe(true);
		expect(interruptSession).not.toHaveBeenCalled();
	});

	describe("slash suggestions", () => {
		it("lists matching skills for /dr", () => {
			setup({ status: "waiting" }, "/dr");
			expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
				"/draft",
				"/dreamproject",
			]);
			expect(highlighted()).toBe("/draft");
		});

		it("moves the highlight with the arrow keys, wrapping", () => {
			const { field } = setup({ status: "waiting" }, "/dr");
			fireEvent.keyDown(field, { key: "ArrowDown" });
			expect(highlighted()).toBe("/dreamproject");
			fireEvent.keyDown(field, { key: "ArrowDown" });
			expect(highlighted()).toBe("/draft");
			fireEvent.keyDown(field, { key: "ArrowUp" });
			expect(highlighted()).toBe("/dreamproject");
		});

		it("inserts the highlighted skill on Tab without sending", () => {
			const { field, sendInput } = setup({ status: "waiting" }, "/dr");
			fireEvent.keyDown(field, { key: "ArrowDown" });
			fireEvent.keyDown(field, { key: "Tab" });
			expect(value(field)).toBe("/dream ");
			expect(screen.queryByRole("listbox")).toBeNull();
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("inserts on Enter instead of sending, then Enter sends", () => {
			const { field, sendInput } = setup({ status: "waiting" }, "/dr");
			fireEvent.keyDown(field, { key: "Enter" });
			expect(value(field)).toBe("/draft ");
			expect(sendInput).not.toHaveBeenCalled();
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith("1", bracketedPaste("/draft "));
		});

		it("inserts a clicked suggestion", () => {
			const { field } = setup({ status: "waiting" }, "then /dr");
			fireEvent.click(screen.getAllByRole("option")[1]);
			expect(value(field)).toBe("then /dream ");
		});

		it("closes on Esc without stopping the turn; a second Esc stops it", () => {
			const { field, interruptSession } = setup({ status: "running" }, "/dr");
			fireEvent.keyDown(field, { key: "Escape" });
			expect(screen.queryByRole("listbox")).toBeNull();
			expect(interruptSession).not.toHaveBeenCalled();
			fireEvent.keyDown(field, { key: "Escape" });
			expect(interruptSession).toHaveBeenCalledTimes(1);
		});

		it("keeps Shift+Enter as a new line while the list is open", () => {
			const { field, sendInput } = setup({ status: "waiting" }, "/dr");
			fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
			expect(value(field)).toBe("/dr");
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("offers nothing for a harness without slash suggestions", () => {
			setup({ status: "waiting", harness: "pi" }, "/dr");
			expect(screen.queryByRole("listbox")).toBeNull();
		});

		it("names a Codex session's agent in the composer label", () => {
			setup({ status: "waiting", harness: "codex-sdk" }, "");
			expect(screen.getByLabelText("Message Codex")).toBeTruthy();
		});
	});

	describe("command highlighting", () => {
		const highlightedText = () =>
			Array.from(document.querySelectorAll("[aria-hidden] span")).map(
				(s) => s.textContent,
			);

		it("highlights known commands but not paths", () => {
			setup({ status: "waiting" }, "/draft see /tmp/notes.md then /dream it");
			expect(highlightedText()).toEqual(["/draft", "/dream"]);
		});

		it("renders no backdrop without a known command", () => {
			setup({ status: "waiting" }, "see /tmp/notes.md");
			expect(highlightedText()).toEqual([]);
		});
	});

	describe("prompt suggestion", () => {
		const suggested = (overrides: Partial<SessionInfo> = {}, initial = "") =>
			setup(
				{ status: "waiting", sdkPromptSuggestion: "commit this", ...overrides },
				initial,
			);
		const tabHint = () =>
			screen.queryByText((_, el) =>
				Boolean(
					el?.matches("span") && el.textContent?.endsWith("edit suggestion"),
				),
			);

		const enterHint = () =>
			screen
				.getAllByText((_, el) =>
					Boolean(el?.matches("span") && el.textContent?.startsWith("Enter")),
				)
				.at(-1)?.textContent;

		it("shows the suggestion as ghost text in the empty field", () => {
			const { field } = suggested();
			expect(field.getAttribute("placeholder")).toBe("commit this");
			expect(tabHint()).not.toBeNull();
		});

		it("fills the field on Tab without sending, then Enter sends", () => {
			const { field, sendInput } = suggested();
			fireEvent.keyDown(field, { key: "Tab" });
			expect(value(field)).toBe("commit this");
			expect(sendInput).not.toHaveBeenCalled();
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith(
				"1",
				bracketedPaste("commit this"),
			);
		});

		it("hides the ghost text once the user types", () => {
			const { field } = suggested({}, "fix");
			expect(field.getAttribute("placeholder")).not.toBe("commit this");
			expect(tabHint()).toBeNull();
			fireEvent.keyDown(field, { key: "Tab" });
			expect(value(field)).toBe("fix");
		});

		it("is not shown while a turn is running", () => {
			const { field } = suggested({ status: "running" });
			expect(field.getAttribute("placeholder")).not.toBe("commit this");
			fireEvent.keyDown(field, { key: "Tab" });
			expect(value(field)).toBe("");
		});

		it("fills the field on right-arrow without sending", () => {
			const { field, sendInput } = suggested();
			fireEvent.keyDown(field, { key: "ArrowRight" });
			expect(value(field)).toBe("commit this");
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("leaves typed text alone on right-arrow", () => {
			const { field } = suggested({}, "fix");
			fireEvent.keyDown(field, { key: "ArrowRight" });
			expect(value(field)).toBe("fix");
		});

		it("does nothing special on right-arrow without a suggestion", () => {
			const { field } = suggested({ sdkPromptSuggestion: undefined });
			fireEvent.keyDown(field, { key: "ArrowRight" });
			expect(value(field)).toBe("");
		});

		it("ignores right-arrow with a modifier", () => {
			const { field } = suggested();
			fireEvent.keyDown(field, { key: "ArrowRight", shiftKey: true });
			expect(value(field)).toBe("");
		});

		it("names both keys in the hint", () => {
			suggested();
			expect(tabHint()?.textContent).toBe("Tab / → edit suggestion");
			expect(enterHint()).toBe("Enter send suggestion");
		});

		it("keeps the plain Enter hint without a suggestion", () => {
			suggested({ sdkPromptSuggestion: undefined });
			expect(tabHint()).toBeNull();
			expect(enterHint()).toBe("Enter send");
		});

		it("labels Send as sending the suggestion", () => {
			suggested();
			const button = screen.getByRole("button", { name: "Send suggestion" });
			expect(button.hasAttribute("disabled")).toBe(false);
			expect(button.getAttribute("title")).toBe("Send suggestion (Enter)");
		});

		it("sends the suggestion from the Send button", () => {
			const { sendInput } = suggested();
			fireEvent.click(screen.getByRole("button", { name: "Send suggestion" }));
			expect(sendInput).toHaveBeenCalledWith(
				"1",
				bracketedPaste("commit this"),
			);
		});

		it("sends the suggestion on Enter in an empty field", () => {
			const { field, sendInput } = suggested();
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith(
				"1",
				bracketedPaste("commit this"),
			);
		});

		it("sends typed text over the suggestion", () => {
			const { field, sendInput } = suggested({}, "fix");
			expect(screen.getByRole("button", { name: "Send" })).toBeTruthy();
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).toHaveBeenCalledWith("1", bracketedPaste("fix"));
		});

		it("keeps Send disabled without a suggestion", () => {
			const { field, sendInput } = suggested({
				sdkPromptSuggestion: undefined,
			});
			const button = screen.getByRole("button", { name: "Send" });
			expect(button.hasAttribute("disabled")).toBe(true);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("sends no suggestion while resuming", () => {
			const { field, sendInput } = suggested({ sdkResuming: true });
			fireEvent.keyDown(field, { key: "Enter" });
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("sends no suggestion in shell mode", () => {
			const runShell = vi.fn();
			const sendInput = vi.fn();
			render(
				<RunShellCommandContext.Provider value={runShell}>
					<SdkComposer
						session={makeSessionInfo({
							sdk: true,
							cwd: "/repo",
							status: "waiting",
							sdkPromptSuggestion: "commit this",
						})}
						sendInput={sendInput}
						interruptSession={vi.fn()}
					/>
				</RunShellCommandContext.Provider>,
			);
			const field = screen.getByLabelText(/^Message /);
			type(field, "!");
			const run = screen.getByRole("button", { name: "Run command" });
			expect(run.hasAttribute("disabled")).toBe(true);
			fireEvent.keyDown(field, { key: "Enter" });
			expect(runShell).not.toHaveBeenCalled();
			expect(sendInput).not.toHaveBeenCalled();
		});

		it("keeps Tab for the slash list when it is open", () => {
			const { field } = suggested({}, "/dr");
			fireEvent.keyDown(field, { key: "Tab" });
			expect(value(field)).toBe("/draft ");
		});
	});
});
