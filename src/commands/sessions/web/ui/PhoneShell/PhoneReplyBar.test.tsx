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

const chip = () =>
	screen.queryByRole("button", { name: "Use suggestion: run the tests" });

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

	it("shows the suggestion chip while the field is empty and fills it on tap", () => {
		const onSend = vi.fn();
		render(<PhoneReplyBar suggestion="run the tests" onSend={onSend} />);
		fireEvent.click(chip() as HTMLElement);
		const field = screen.getByLabelText("Reply") as HTMLTextAreaElement;
		expect(field.value).toBe("run the tests");
		expect(onSend).not.toHaveBeenCalled();
		expect(chip()).toBeNull();
	});

	it("hides the suggestion chip once the user types", () => {
		render(<PhoneReplyBar suggestion="run the tests" onSend={() => {}} />);
		type("no");
		expect(chip()).toBeNull();
	});

	it("hides the suggestion chip while the field is locked", () => {
		render(
			<PhoneReplyBar
				suggestion="run the tests"
				locked="Resuming conversation…"
				onSend={() => {}}
			/>,
		);
		expect(chip()).toBeNull();
	});

	it("sends the suggestion from an empty field", () => {
		const onSend = vi.fn();
		render(<PhoneReplyBar suggestion="run the tests" onSend={onSend} />);
		fireEvent.click(screen.getByRole("button", { name: "Send suggestion" }));
		expect(onSend).toHaveBeenCalledWith("run the tests");
	});

	it("sends typed text over the suggestion", () => {
		const onSend = vi.fn();
		render(<PhoneReplyBar suggestion="run the tests" onSend={onSend} />);
		type("no");
		fireEvent.click(screen.getByRole("button", { name: "Send" }));
		expect(onSend).toHaveBeenCalledWith("no");
	});

	it("keeps Send disabled without a suggestion", () => {
		render(<PhoneReplyBar onSend={() => {}} />);
		const send = screen.getByRole("button", { name: "Send" });
		expect((send as HTMLButtonElement).disabled).toBe(true);
	});

	it("does not send the suggestion while the field is locked", () => {
		render(
			<PhoneReplyBar
				suggestion="run the tests"
				locked="Resuming conversation…"
				onSend={() => {}}
			/>,
		);
		const send = screen.getByRole("button", { name: "Send" });
		expect((send as HTMLButtonElement).disabled).toBe(true);
	});

	it("does not send the suggestion in shell mode", () => {
		const onSend = vi.fn();
		const onRunShell = vi.fn();
		render(
			<PhoneReplyBar
				suggestion="run the tests"
				onSend={onSend}
				onRunShell={onRunShell}
			/>,
		);
		type("!");
		const run = screen.getByRole("button", { name: "Run command" });
		expect((run as HTMLButtonElement).disabled).toBe(true);
		expect(chip()).toBeNull();
	});
});
