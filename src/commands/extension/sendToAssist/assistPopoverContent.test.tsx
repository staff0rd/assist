// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assistPopoverContent } from "./assistPopoverContent";

afterEach(cleanup);

function field(): HTMLTextAreaElement {
	return screen.getByLabelText("Instructions for assist");
}

describe("assistPopoverContent", () => {
	it("closes on blur even with instructions typed", () => {
		const dismiss = vi.fn();
		render(assistPopoverContent("instructions", { send: vi.fn(), dismiss }));
		fireEvent.change(field(), { target: { value: "Rebase first" } });
		fireEvent.blur(field());
		expect(dismiss).toHaveBeenCalledWith(false);
	});

	it("sends as Prompt on Enter", () => {
		const send = vi.fn();
		render(assistPopoverContent("instructions", { send, dismiss: vi.fn() }));
		fireEvent.change(field(), { target: { value: "Rebase first" } });
		fireEvent.keyDown(field(), { key: "Enter" });
		expect(send).toHaveBeenCalledWith({ instructions: "Rebase first" });
	});

	it("sends as Prompt from the Prompt button", () => {
		const send = vi.fn();
		render(assistPopoverContent("instructions", { send, dismiss: vi.fn() }));
		fireEvent.click(screen.getByRole("button", { name: "Prompt" }));
		expect(send).toHaveBeenCalledWith({ instructions: undefined });
	});

	it.each([
		["Draft", "draft"],
		["Bug", "bug"],
	])("sends from the %s button with the %s mode", (name, mode) => {
		const send = vi.fn();
		const dismiss = vi.fn();
		render(assistPopoverContent("instructions", { send, dismiss }));
		fireEvent.change(field(), { target: { value: "Rebase first" } });
		fireEvent.click(screen.getByRole("button", { name }));
		expect(dismiss).toHaveBeenCalledWith(false);
		expect(send).toHaveBeenCalledWith({ instructions: "Rebase first", mode });
	});

	it("stays open when focus moves to a button", () => {
		const dismiss = vi.fn();
		render(assistPopoverContent("instructions", { send: vi.fn(), dismiss }));
		fireEvent.blur(field(), {
			relatedTarget: screen.getByRole("button", { name: "Draft" }),
		});
		expect(dismiss).not.toHaveBeenCalled();
	});

	it("leaves Ctrl+C to the browser", () => {
		const writeText = vi.fn();
		Object.assign(navigator, { clipboard: { writeText } });
		render(
			assistPopoverContent("instructions", { send: vi.fn(), dismiss: vi.fn() }),
		);
		const event = fireEvent.keyDown(field(), { key: "c", ctrlKey: true });
		expect(event).toBe(true);
		expect(writeText).not.toHaveBeenCalled();
	});
});

describe("review popover prompt", () => {
	it("sends the question with no args on Enter", () => {
		const send = vi.fn();
		const dismiss = vi.fn();
		render(assistPopoverContent("review", { send, dismiss }));
		fireEvent.change(field(), { target: { value: "What changed?" } });
		fireEvent.keyDown(field(), { key: "Enter" });
		expect(dismiss).toHaveBeenCalledWith(false);
		expect(send).toHaveBeenCalledWith({ instructions: "What changed?" });
	});

	it("has no prompt field on Azure DevOps yet", () => {
		render(
			assistPopoverContent("azure-devops-review", {
				send: vi.fn(),
				dismiss: vi.fn(),
			}),
		);
		expect(screen.queryByLabelText("Instructions for assist")).toBeNull();
	});
});
