// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../designSystem/createDesignTheme";
import type { TranscriptMessage } from "../../../../types";
import { skipsSelection } from "../../../textWalker";
import { TranscriptPane } from "./TranscriptPane";

afterEach(cleanup);

const NAME = "Too verbose: say it again, shorter";

function renderPane(messages: TranscriptMessage[], onTooVerbose = vi.fn()) {
	const view = render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<TranscriptPane
				messages={messages}
				loading={false}
				term=""
				onTooVerbose={onTooVerbose}
			/>
		</ThemeProvider>,
	);
	return { onTooVerbose, view };
}

const long = (lead: string) => `${lead}\n\nsecond line\n\nthird line`;

const buttons = () => screen.queryAllByRole("button", { name: NAME });

describe("TranscriptPane too-verbose button", () => {
	const rowText = (button: HTMLElement) =>
		button.closest("div")?.parentElement?.textContent;

	it("shows on every assistant text row", () => {
		renderPane([
			{ role: "user", text: "q" },
			{ role: "assistant", text: long("first reply") },
			{ role: "tool", tool: "Read", target: "a.ts" },
			{ role: "assistant", text: long("second reply") },
		]);
		expect(buttons().map(rowText)).toEqual([
			expect.stringContaining("first reply"),
			expect.stringContaining("second reply"),
		]);
	});

	it.each<[string, TranscriptMessage]>([
		["user", { role: "user", text: "q" }],
		["tool", { role: "tool", tool: "Read", target: "a.ts" }],
		["shell", { role: "shell", command: "ls", stdout: "", stderr: "" }],
		["interrupt", { role: "interrupt" }],
	])("never shows on a %s row", (_, row) => {
		renderPane([row]);
		expect(buttons()).toHaveLength(0);
	});

	it("never shows on a reply of a couple of lines", () => {
		renderPane([{ role: "assistant", text: "Done.\n\nAll tests pass." }]);
		expect(buttons()).toHaveLength(0);
	});

	it("keeps the button out of comment selection", () => {
		renderPane([{ role: "assistant", text: long("reply") }]);
		expect(skipsSelection(buttons()[0])).toBe(true);
	});

	it("passes the reply text and whether it is the last item", () => {
		const { onTooVerbose } = renderPane([
			{ role: "assistant", text: long("earlier") },
			{ role: "user", text: "q" },
			{ role: "assistant", text: long("latest") },
		]);
		fireEvent.click(buttons()[1]);
		fireEvent.click(buttons()[0]);
		expect(onTooVerbose.mock.calls).toEqual([
			[long("latest"), true],
			[long("earlier"), false],
		]);
	});

	it("treats a reply followed by tool runs as earlier", () => {
		const { onTooVerbose } = renderPane([
			{ role: "assistant", text: long("narration") },
			{ role: "tool", tool: "Read", target: "a.ts" },
		]);
		fireEvent.click(buttons()[0]);
		expect(onTooVerbose).toHaveBeenCalledWith(long("narration"), false);
	});

	it("hides only the clicked message's button", () => {
		renderPane([
			{ role: "assistant", text: long("one") },
			{ role: "assistant", text: long("two") },
			{ role: "assistant", text: long("three") },
		]);
		fireEvent.click(buttons()[1]);
		expect(buttons().map(rowText)).toEqual([
			expect.stringContaining("one"),
			expect.stringContaining("three"),
		]);
	});
});
