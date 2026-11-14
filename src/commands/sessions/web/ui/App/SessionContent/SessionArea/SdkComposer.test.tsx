// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { bracketedPaste } from "../../../../../shared/pasteAndSubmit/bracketedPaste";
import type { SessionInfo } from "../../../types";
import { SdkComposer } from "./SdkComposer";

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

afterEach(cleanup);

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
	const field = screen.getByLabelText("Message Claude");
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
			setup({ status: "waiting", harness: "codex" }, "/dr");
			expect(screen.queryByRole("listbox")).toBeNull();
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
});
