// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { PhoneReplyBar } from "./PhoneReplyBar";

afterEach(cleanup);

const commands: SlashCommand[] = [
	{ name: "draft", description: "Draft a backlog item", scope: "user" },
	{ name: "refine", description: "Refine an item", scope: "user" },
	{ name: "review", description: "Project review", scope: "project" },
];

function type(value: string, cursor = value.length) {
	const field = screen.getByLabelText("Reply") as HTMLTextAreaElement;
	fireEvent.change(field, {
		target: { value, selectionStart: cursor, selectionEnd: cursor },
	});
	return field;
}

const options = () =>
	screen.queryAllByRole("option").map((option) => option.textContent);

describe("PhoneReplyBar", () => {
	it("addresses Claude when the session has no harness", () => {
		render(<PhoneReplyBar onSend={() => {}} />);
		expect(screen.getByPlaceholderText("Reply to Claude…")).toBeTruthy();
	});

	it("addresses the session's harness", () => {
		render(<PhoneReplyBar harness="codex" onSend={() => {}} />);
		expect(screen.getByPlaceholderText("Reply to Codex…")).toBeTruthy();
	});

	it("lists commands matching the slash word, user before project", () => {
		render(<PhoneReplyBar commands={commands} onSend={() => {}} />);
		type("ok, then /re");
		expect(options()).toEqual([
			"/refineRefine an item",
			"/reviewprojectProject review",
		]);
	});

	it("hides the list when nothing matches", () => {
		render(<PhoneReplyBar commands={commands} onSend={() => {}} />);
		type("/tmp");
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("replaces the slash word with the picked name", () => {
		render(<PhoneReplyBar commands={commands} onSend={() => {}} />);
		const field = type("then /dr");
		fireEvent.click(screen.getByRole("option"));
		expect(field.value).toBe("then /draft ");
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("sends the raw text without picking a suggestion", () => {
		const onSend = vi.fn();
		render(<PhoneReplyBar commands={commands} onSend={onSend} />);
		type("/dr");
		fireEvent.click(screen.getByLabelText("Send"));
		expect(onSend).toHaveBeenCalledWith("/dr");
	});
});
