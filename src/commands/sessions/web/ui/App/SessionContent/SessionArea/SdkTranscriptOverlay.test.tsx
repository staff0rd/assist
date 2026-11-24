// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { holdFocus } from "../../holdFocus";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { bracketedPaste } from "../../../../../shared/pasteAndSubmit/bracketedPaste";
import { createDesignTheme } from "../../../designSystem/createDesignTheme";
import { HistorySearchQueryProvider } from "../../useHistorySearchQuery";
import type { SessionInfo } from "../../../types";
import { SdkTranscriptOverlay } from "./SdkTranscriptOverlay";
import { tooVerbosePrompt } from "./tooVerbosePrompt";

vi.mock("../../../slashSuggestions/useSlashCommands", () => ({
	useSlashCommands: () => [],
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	globalThis.getSelection()?.removeAllRanges();
});

function renderOverlay(overrides: Partial<SessionInfo> = {}) {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<HistorySearchQueryProvider>
				<SdkTranscriptOverlay
					session={makeSessionInfo({ id: "s1", sdk: true, ...overrides })}
					transcript={{
						sessionId: "s1",
						messages: [
							{ role: "assistant", text: "a long reply\n\nsecond\n\nthird" },
						],
					}}
					fetchSessionTranscript={vi.fn()}
					sendInput={vi.fn()}
					interruptSession={vi.fn()}
				/>
			</HistorySearchQueryProvider>
		</ThemeProvider>,
	);
	const composer = screen.getByLabelText("Message Claude");
	const outside = document.createElement("button");
	document.body.append(outside);
	outside.focus();
	return { composer, outside };
}

const composerBar = (composer: HTMLElement) =>
	composer.closest(".MuiInputBase-root")?.parentElement as HTMLElement;

describe("SdkTranscriptOverlay", () => {
	function clickTooVerbose(index: number) {
		const sendInput = vi.fn();
		render(
			<ThemeProvider theme={createDesignTheme("dark")}>
				<HistorySearchQueryProvider>
					<SdkTranscriptOverlay
						session={makeSessionInfo({ id: "s1", sdk: true })}
						transcript={{
							sessionId: "s1",
							messages: [
								{
									role: "assistant",
									text: "an earlier long reply\n\nsecond\n\nthird",
								},
								{ role: "user", text: "next" },
								{ role: "assistant", text: "a long reply\n\nsecond\n\nthird" },
							],
						}}
						fetchSessionTranscript={vi.fn()}
						sendInput={sendInput}
						interruptSession={vi.fn()}
					/>
				</HistorySearchQueryProvider>
			</ThemeProvider>,
		);
		fireEvent.click(
			screen.getAllByRole("button", {
				name: "Too verbose: say it again, shorter",
			})[index],
		);
		return sendInput;
	}

	it("sends the unquoted too-verbose prompt for the last reply", () => {
		expect(clickTooVerbose(1)).toHaveBeenCalledWith(
			"s1",
			bracketedPaste(tooVerbosePrompt),
		);
	});

	it("quotes an earlier reply before the too-verbose prompt", () => {
		expect(clickTooVerbose(0)).toHaveBeenCalledWith(
			"s1",
			bracketedPaste(
				`> an earlier long reply\n>\n> second\n>\n> third\n\n${tooVerbosePrompt}`,
			),
		);
	});

	it("focuses the composer on an empty-space click", () => {
		const { composer } = renderOverlay();
		fireEvent.click(composerBar(composer));
		expect(document.activeElement).toBe(composer);
	});

	it("leaves focus alone on a click on transcript text", () => {
		const { outside } = renderOverlay();
		const words = screen.getByText("a long reply");
		const range = document.createRange();
		range.setStart(words.firstChild as Node, 2);
		Object.assign(document, { caretRangeFromPoint: () => range });
		Range.prototype.getClientRects = () =>
			[{ left: 0, right: 100, top: 0, bottom: 20 }] as unknown as DOMRectList;
		fireEvent.click(words, { clientX: 10, clientY: 10 });
		Reflect.deleteProperty(document, "caretRangeFromPoint");
		Reflect.deleteProperty(Range.prototype, "getClientRects");
		expect(document.activeElement).toBe(outside);
	});

	it("leaves focus alone on a button and still runs it", () => {
		const { composer, outside } = renderOverlay();
		fireEvent.click(
			screen.getByRole("button", {
				name: "Too verbose: say it again, shorter",
			}),
		);
		expect(document.activeElement).not.toBe(composer);
		expect(document.activeElement).toBe(outside);
	});

	it("leaves focus and selection alone when text is selected", () => {
		const { composer, outside } = renderOverlay();
		const range = document.createRange();
		range.selectNodeContents(screen.getByText("a long reply"));
		globalThis.getSelection()?.removeAllRanges();
		globalThis.getSelection()?.addRange(range);
		fireEvent.click(composerBar(composer));
		expect(document.activeElement).toBe(outside);
		expect(globalThis.getSelection()?.toString()).toBe("a long reply");
	});

	it("leaves focus alone after a drag", () => {
		const { composer, outside } = renderOverlay();
		const bar = composerBar(composer);
		fireEvent.mouseDown(bar, { clientX: 0, clientY: 0 });
		fireEvent.click(bar, { clientX: 40, clientY: 0 });
		expect(document.activeElement).toBe(outside);
	});

	it("leaves focus alone while focus is held", () => {
		const { composer, outside } = renderOverlay();
		holdFocus(outside);
		fireEvent.click(composerBar(composer));
		expect(document.activeElement).toBe(outside);
	});

	it("leaves focus alone when the composer is disabled", () => {
		const { composer, outside } = renderOverlay({ status: "done" });
		expect((composer as HTMLTextAreaElement).disabled).toBe(true);
		fireEvent.click(composerBar(composer));
		expect(document.activeElement).toBe(outside);
	});
});
