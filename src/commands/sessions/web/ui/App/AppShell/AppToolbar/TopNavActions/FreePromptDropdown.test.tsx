// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FreePromptDropdown } from "./FreePromptDropdown";

afterEach(cleanup);

function renderDropdown(
	onSubmit: (prompt: string) => void,
	allowEmpty = true,
	disabled = false,
) {
	render(
		<FreePromptDropdown
			disabled={disabled}
			onSubmit={onSubmit}
			allowEmpty={allowEmpty}
		/>,
	);
}

function openDropdown(onSubmit: (prompt: string) => void, allowEmpty = true) {
	renderDropdown(onSubmit, allowEmpty);
	fireEvent.click(
		screen.getByRole("button", {
			name: allowEmpty ? "prompt options" : "prompt",
		}),
	);
	return screen.getByRole("textbox");
}

describe("FreePromptDropdown", () => {
	it("submits an empty prompt without opening the dropdown when the label is clicked", () => {
		const onSubmit = vi.fn();
		renderDropdown(onSubmit);

		fireEvent.click(screen.getByRole("button", { name: "prompt" }));

		expect(onSubmit).toHaveBeenCalledWith("");
		expect(screen.queryByRole("textbox")).not.toBeTruthy();
	});

	it("titles the chevron half distinctly from the label half", () => {
		renderDropdown(vi.fn());

		const chevron = screen.getByRole("button", { name: "prompt options" });

		expect(chevron.getAttribute("title")).toBe("prompt options");
		expect(chevron.getAttribute("aria-expanded")).toBe("false");
	});

	it("disables both halves when the trigger is disabled", () => {
		renderDropdown(vi.fn(), true, true);

		expect(
			screen.getByRole("button", { name: "prompt" }).hasAttribute("disabled"),
		).toBe(true);
		expect(
			screen
				.getByRole("button", { name: "prompt options" })
				.hasAttribute("disabled"),
		).toBe(true);
	});

	it("keeps the dropdown open while focus moves between the halves", () => {
		const onSubmit = vi.fn();
		renderDropdown(onSubmit);
		const chevron = screen.getByRole("button", { name: "prompt options" });
		fireEvent.click(chevron);

		fireEvent.blur(chevron, {
			relatedTarget: screen.getByRole("button", { name: "prompt" }),
		});

		expect(screen.getByRole("textbox")).toBeTruthy();
	});

	it("closes the dropdown when focus leaves the trigger entirely", () => {
		const onSubmit = vi.fn();
		renderDropdown(onSubmit);
		const chevron = screen.getByRole("button", { name: "prompt options" });
		fireEvent.click(chevron);

		fireEvent.blur(chevron, { relatedTarget: document.body });

		expect(screen.queryByRole("textbox")).not.toBeTruthy();
	});

	it("keeps the single trigger when empty is not allowed", () => {
		const onSubmit = vi.fn();
		renderDropdown(onSubmit, false);

		expect(
			screen.queryByRole("button", { name: "prompt options" }),
		).not.toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "prompt" }));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole("textbox")).toBeTruthy();
	});

	it("submits an empty prompt on Enter when empty is allowed", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledWith("");
	});

	it("submits the typed prompt on Enter", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.change(input, { target: { value: "ship it" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).toHaveBeenCalledWith("ship it");
		expect(screen.queryByRole("textbox")).not.toBeTruthy();
	});

	it("does not submit on Shift+Enter", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("does not submit while an IME composition is active", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit);

		fireEvent.keyDown(input, { key: "Enter", isComposing: true });

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("ignores an empty prompt on Enter when empty is not allowed", () => {
		const onSubmit = vi.fn();
		const input = openDropdown(onSubmit, false);

		fireEvent.keyDown(input, { key: "Enter" });

		expect(onSubmit).not.toHaveBeenCalled();
	});
});
