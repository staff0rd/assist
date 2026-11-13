// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FreePromptForm } from "./FreePromptForm";

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

const commands = [
	{ name: "draft", scope: "user" as const },
	{ name: "dream", scope: "project" as const },
];

function setup() {
	const onSubmit = vi.fn();
	const onOuterKey = vi.fn();
	function Form() {
		const [value, setValue] = useState("");
		return (
			<div onKeyDown={(e) => onOuterKey(e.key)}>
				<FreePromptForm
					commands={commands}
					value={value}
					onChange={setValue}
					onSubmit={onSubmit}
				/>
			</div>
		);
	}
	render(<Form />);
	const field = screen.getByRole("textbox") as HTMLTextAreaElement;
	const type = (value: string) =>
		fireEvent.change(field, {
			target: {
				value,
				selectionStart: value.length,
				selectionEnd: value.length,
			},
		});
	return { field, type, onSubmit, onOuterKey };
}

describe("FreePromptForm slash suggestions", () => {
	it("inserts the highlighted skill on Enter, and Enter then submits", () => {
		const { field, type, onSubmit } = setup();
		type("/dr");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(field.value).toBe("/draft ");
		expect(onSubmit).not.toHaveBeenCalled();
		fireEvent.keyDown(field, { key: "Enter" });
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("keeps Shift+Enter as a new line", () => {
		const { field, type, onSubmit } = setup();
		type("/dr");
		fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
		expect(field.value).toBe("/dr");
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("closes the list on Esc without letting Esc close the popover", () => {
		const { field, type, onOuterKey } = setup();
		type("/dr");
		fireEvent.keyDown(field, { key: "Escape" });
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(onOuterKey).not.toHaveBeenCalled();
		fireEvent.keyDown(field, { key: "Escape" });
		expect(onOuterKey).toHaveBeenCalledWith("Escape");
	});
});
