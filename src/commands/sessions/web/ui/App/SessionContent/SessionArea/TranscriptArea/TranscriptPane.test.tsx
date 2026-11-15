// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../designSystem/createDesignTheme";
import type { TranscriptMessage } from "../../../../types";
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

const buttons = () => screen.queryAllByRole("button", { name: NAME });

describe("TranscriptPane too-verbose button", () => {
	it("shows only on the last assistant text row", () => {
		renderPane([
			{ role: "user", text: "q" },
			{ role: "assistant", text: "first reply" },
			{ role: "tool", tool: "Read", target: "a.ts" },
			{ role: "assistant", text: "second reply" },
		]);
		expect(buttons()).toHaveLength(1);
		const row = buttons()[0].closest("div")?.parentElement;
		expect(row?.textContent).toContain("second reply");
	});

	it.each<[string, TranscriptMessage]>([
		["user", { role: "user", text: "q" }],
		["tool", { role: "tool", tool: "Read", target: "a.ts" }],
		["shell", { role: "shell", command: "ls", stdout: "", stderr: "" }],
	])("is absent when the last row is a %s row", (_, last) => {
		renderPane([{ role: "assistant", text: "reply" }, last]);
		expect(buttons()).toHaveLength(0);
	});

	it("calls onTooVerbose and hides until a new reply is last", () => {
		const reply: TranscriptMessage = { role: "assistant", text: "long" };
		const { onTooVerbose, view } = renderPane([reply]);
		fireEvent.click(buttons()[0]);
		expect(onTooVerbose).toHaveBeenCalledOnce();
		expect(buttons()).toHaveLength(0);

		view.rerender(
			<ThemeProvider theme={createDesignTheme("dark")}>
				<TranscriptPane
					messages={[
						reply,
						{ role: "user", text: "shorter" },
						{ role: "assistant", text: "short" },
					]}
					loading={false}
					term=""
					onTooVerbose={onTooVerbose}
				/>
			</ThemeProvider>,
		);
		expect(buttons()).toHaveLength(1);
	});
});
