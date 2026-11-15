// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { bracketedPaste } from "../../../../../shared/pasteAndSubmit/bracketedPaste";
import { createDesignTheme } from "../../../designSystem/createDesignTheme";
import { HistorySearchQueryProvider } from "../../useHistorySearchQuery";
import { SdkTranscriptOverlay } from "./SdkTranscriptOverlay";
import { tooVerbosePrompt } from "./tooVerbosePrompt";

vi.mock("../../../slashSuggestions/useSlashCommands", () => ({
	useSlashCommands: () => [],
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe("SdkTranscriptOverlay", () => {
	it("sends the restate-concisely prompt from the too-verbose button", () => {
		const sendInput = vi.fn();
		render(
			<ThemeProvider theme={createDesignTheme("dark")}>
				<HistorySearchQueryProvider>
					<SdkTranscriptOverlay
						session={makeSessionInfo({ id: "s1", sdk: true })}
						transcript={{
							sessionId: "s1",
							messages: [{ role: "assistant", text: "a long reply" }],
						}}
						fetchSessionTranscript={vi.fn()}
						sendInput={sendInput}
						interruptSession={vi.fn()}
					/>
				</HistorySearchQueryProvider>
			</ThemeProvider>,
		);
		fireEvent.click(
			screen.getByRole("button", {
				name: "Too verbose: say it again, shorter",
			}),
		);
		expect(sendInput).toHaveBeenCalledWith(
			"s1",
			bracketedPaste(tooVerbosePrompt),
		);
	});
});
