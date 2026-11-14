// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { openDocsFeedback } from "./openDocsFeedback";
import { readDocsSelection } from "./readDocsSelection";
import { restoreDocsFeedbackDraft } from "./restoreDocsFeedbackDraft";
import { sendDocsFeedback } from "./sendDocsFeedback";

vi.mock("./sendDocsFeedback", () => ({ sendDocsFeedback: vi.fn() }));
vi.mock("../sendToAssist/showAssistToast", () => ({
	showAssistToast: vi.fn(),
}));

const KEY = "assist-docs-feedback-draft";
const DRAFT = {
	pageId: "start",
	heading: "Install",
	source: "docs/guide/pages/start.json",
	selection: "npm install",
	prompt: "Pin the version",
};

function render(text = "Run npm\n  install to begin.", pageId = "start") {
	document.head.innerHTML = `<meta name="assist-docs-page" content="${pageId}">`;
	document.body.innerHTML = `
<main><h1>Getting started</h1>
<section data-docs-heading="Install" data-docs-source="docs/guide/pages/start.json">
	<h2 id="heading">Install</h2><p id="text">${text}</p>
</section></main>`;
}

function textarea(): HTMLTextAreaElement {
	return document
		.querySelector("[data-assist-popover]")
		?.shadowRoot?.querySelector("textarea") as HTMLTextAreaElement;
}

function restore() {
	let release: (() => void) | undefined;
	act(() => {
		release = restoreDocsFeedbackDraft(document);
	});
	return release;
}

function stored(): unknown {
	return JSON.parse(sessionStorage.getItem(KEY) ?? "null");
}

beforeAll(() => {
	Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
	Range.prototype.getBoundingClientRect = () => new DOMRect(10, 20, 30, 40);
});

afterEach(() => {
	if (textarea())
		act(() => {
			fireEvent.keyDown(textarea(), { key: "Escape" });
		});
	sessionStorage.clear();
	document.head.innerHTML = "";
	document.body.innerHTML = "";
});

describe("docs feedback draft", () => {
	it("saves the typed prompt with its page, section and selection", () => {
		render("Run npm install to begin.");
		const text = document.getElementById("text")?.firstChild as Text;
		const selection = globalThis.getSelection() as Selection;
		selection.removeAllRanges();
		const range = document.createRange();
		range.setStart(text, 4);
		range.setEnd(text, 15);
		selection.addRange(range);
		act(() => {
			openDocsFeedback(
				readDocsSelection(document, selection) as NonNullable<
					ReturnType<typeof readDocsSelection>
				>,
			);
		});
		act(() => {
			fireEvent.change(textarea(), { target: { value: "Pin the version" } });
		});
		expect(stored()).toEqual(DRAFT);
		act(() => {
			fireEvent.change(textarea(), { target: { value: " " } });
		});
		expect(stored()).toBeNull();
	});

	it("reopens the saved draft anchored to the selected text after a reload", () => {
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render();
		restore();
		expect(textarea().value).toBe("Pin the version");
		const anchor = document.querySelector("[data-assist-docs-feedback]");
		expect(anchor).not.toBeNull();
	});

	it("re-anchors to the section heading when the text changed", () => {
		const highlights = new Map<string, { range: Range }>();
		vi.stubGlobal("CSS", { highlights });
		vi.stubGlobal(
			"Highlight",
			class {
				constructor(readonly range: Range) {}
			},
		);
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render("Run pnpm add to begin.");
		restore();
		expect(textarea().value).toBe("Pin the version");
		expect(highlights.size).toBe(0);
		vi.unstubAllGlobals();
	});

	it("highlights the selected text when it is still on the page", () => {
		const highlights = new Map<string, { range: Range }>();
		vi.stubGlobal("CSS", { highlights });
		vi.stubGlobal(
			"Highlight",
			class {
				constructor(readonly range: Range) {}
			},
		);
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render();
		restore();
		expect(highlights.get("assist-docs-feedback")?.range.toString()).toBe(
			"npm\n  install",
		);
		vi.unstubAllGlobals();
	});

	it("never restores a draft on a different page", () => {
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render(undefined, "other");
		expect(restore()).toBeUndefined();
		expect(textarea()).toBeUndefined();
	});

	it("clears the draft on dismiss", () => {
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render();
		restore();
		act(() => {
			fireEvent.keyDown(textarea(), { key: "Escape" });
		});
		expect(stored()).toBeNull();
	});

	it("clears the draft once sent", async () => {
		vi.mocked(sendDocsFeedback).mockResolvedValue({ ok: true, message: "ok" });
		sessionStorage.setItem(KEY, JSON.stringify(DRAFT));
		render();
		restore();
		await act(async () => {
			fireEvent.keyDown(textarea(), { key: "Enter" });
		});
		expect(sendDocsFeedback).toHaveBeenCalledWith(
			expect.objectContaining({ selection: "npm install" }),
			"Pin the version",
		);
		expect(stored()).toBeNull();
	});
});
