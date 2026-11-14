// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { docsFeedbackSender } from "./docsFeedbackSender";
import { sendDocsFeedback } from "./sendDocsFeedback";

vi.mock("./sendDocsFeedback", () => ({ sendDocsFeedback: vi.fn() }));
vi.mock("../sendToAssist/showAssistToast", () => ({
	showAssistToast: vi.fn(),
}));

function selectionIn(element: Element) {
	const range = document.createRange();
	range.selectNodeContents(element.firstChild as Node);
	return {
		pageId: "config",
		heading: "Intro",
		source: "docs/config.md",
		selection: "new",
		range,
	};
}

describe("docsFeedbackSender", () => {
	it("announces a sent comment from the selection", async () => {
		document.body.innerHTML = "<p>new</p>";
		const listener = vi.fn();
		document.addEventListener("assist-docs-commented", listener);
		const paragraph = document.querySelector("p") as Element;
		vi.mocked(sendDocsFeedback).mockResolvedValue({ ok: false, message: "x" });
		const send = docsFeedbackSender(selectionIn(paragraph), vi.fn());
		await send("Reword");
		expect(listener).not.toHaveBeenCalled();
		vi.mocked(sendDocsFeedback).mockResolvedValue({ ok: true, message: "ok" });
		await send("Reword");
		expect(listener.mock.calls[0][0].target).toBe(paragraph);
	});
});
