import { describe, expect, it, vi } from "vitest";
import {
	type ClipboardApi,
	type ClipboardTerm,
	handleClipboardKey,
} from "./handleClipboardKey";

function makeTerm(overrides: Partial<ClipboardTerm> = {}): ClipboardTerm {
	return {
		hasSelection: () => false,
		getSelection: () => "",
		...overrides,
	};
}

function makeClipboard(readValue = ""): ClipboardApi & {
	writeText: ReturnType<typeof vi.fn>;
	readText: ReturnType<typeof vi.fn>;
} {
	return {
		writeText: vi.fn(() => Promise.resolve()),
		readText: vi.fn(() => Promise.resolve(readValue)),
	};
}

function keyEvent(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		type: "keydown",
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		key: "",
		...overrides,
	} as KeyboardEvent;
}

describe("handleClipboardKey", () => {
	it("copies the selection to the clipboard on Ctrl+C and suppresses default", () => {
		const term = makeTerm({
			hasSelection: () => true,
			getSelection: () => "selected text",
		});
		const clipboard = makeClipboard();
		const paste = vi.fn();

		const result = handleClipboardKey(
			keyEvent({ ctrlKey: true, key: "c" }),
			term,
			clipboard,
			paste,
		);

		expect(result).toBe(false);
		expect(clipboard.writeText).toHaveBeenCalledWith("selected text");
		expect(paste).not.toHaveBeenCalled();
	});

	it("preserves interrupt behaviour on Ctrl+C when there is no selection", () => {
		const clipboard = makeClipboard();

		const result = handleClipboardKey(
			keyEvent({ ctrlKey: true, key: "c" }),
			makeTerm({ hasSelection: () => false }),
			clipboard,
			vi.fn(),
		);

		expect(result).toBe(true);
		expect(clipboard.writeText).not.toHaveBeenCalled();
	});

	it("pastes clipboard contents on Ctrl+V and suppresses default", async () => {
		const clipboard = makeClipboard("pasted text");
		const paste = vi.fn();

		const result = handleClipboardKey(
			keyEvent({ ctrlKey: true, key: "v" }),
			makeTerm(),
			clipboard,
			paste,
		);

		expect(result).toBe(false);
		expect(clipboard.readText).toHaveBeenCalled();
		await Promise.resolve();
		expect(paste).toHaveBeenCalledWith("pasted text");
	});

	it("handles uppercase keys (e.g. caps lock)", () => {
		const term = makeTerm({
			hasSelection: () => true,
			getSelection: () => "x",
		});
		const clipboard = makeClipboard();

		expect(
			handleClipboardKey(
				keyEvent({ ctrlKey: true, key: "C" }),
				term,
				clipboard,
				vi.fn(),
			),
		).toBe(false);
		expect(clipboard.writeText).toHaveBeenCalledWith("x");
	});

	it("ignores keys without Ctrl", () => {
		const clipboard = makeClipboard("text");

		const result = handleClipboardKey(
			keyEvent({ ctrlKey: false, key: "v" }),
			makeTerm(),
			clipboard,
			vi.fn(),
		);

		expect(result).toBe(true);
		expect(clipboard.readText).not.toHaveBeenCalled();
	});

	it("ignores keydown with Shift held (e.g. Ctrl+Shift+C)", () => {
		const term = makeTerm({
			hasSelection: () => true,
			getSelection: () => "x",
		});
		const clipboard = makeClipboard();

		const result = handleClipboardKey(
			keyEvent({ ctrlKey: true, shiftKey: true, key: "c" }),
			term,
			clipboard,
			vi.fn(),
		);

		expect(result).toBe(true);
		expect(clipboard.writeText).not.toHaveBeenCalled();
	});

	it("ignores non-keydown events", () => {
		const clipboard = makeClipboard("text");

		const result = handleClipboardKey(
			keyEvent({ type: "keyup", ctrlKey: true, key: "v" }),
			makeTerm(),
			clipboard,
			vi.fn(),
		);

		expect(result).toBe(true);
		expect(clipboard.readText).not.toHaveBeenCalled();
	});
});
