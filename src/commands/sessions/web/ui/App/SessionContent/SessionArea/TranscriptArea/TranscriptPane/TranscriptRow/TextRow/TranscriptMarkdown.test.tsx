// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../../../../designSystem/createDesignTheme";
import { TranscriptMarkdown } from "./TranscriptMarkdown";

const reply =
	"Run this:\n\n```sh\nassist verify\nassist commit\n```\n\nThen open `src/index.ts`.";

function renderReply() {
	return render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<TranscriptMarkdown text={reply} />
		</ThemeProvider>,
	);
}

describe("TranscriptMarkdown", () => {
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it("adds copy buttons for fenced blocks and inline spans", () => {
		const { container } = renderReply();
		const buttons = Array.from(
			container.querySelectorAll<HTMLButtonElement>("button.copy-code"),
		);
		expect(buttons.map((b) => b.dataset.copy)).toEqual([
			"assist verify\nassist commit",
			"src/index.ts",
		]);
		expect(buttons[0]?.parentElement?.tagName).toBe("PRE");
		expect(buttons[1]?.previousElementSibling?.tagName).toBe("CODE");
	});

	it("copies the snippet and shows the copied state briefly", async () => {
		vi.useFakeTimers();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const { container } = renderReply();
		const button =
			container.querySelector<HTMLButtonElement>("button.copy-code");
		if (!button) throw new Error("no copy button");
		await act(async () => {
			fireEvent.click(button.querySelector("svg") ?? button);
		});
		expect(writeText).toHaveBeenCalledWith("assist verify\nassist commit");
		expect(button.classList.contains("copied")).toBe(true);
		act(() => vi.advanceTimersByTime(1200));
		expect(button.classList.contains("copied")).toBe(false);
	});
});
