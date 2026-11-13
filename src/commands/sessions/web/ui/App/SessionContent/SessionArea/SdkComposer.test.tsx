// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { bracketedPaste } from "../../../../../shared/pasteAndSubmit/bracketedPaste";
import type { SessionInfo } from "../../../types";
import { SdkComposer } from "./SdkComposer";

afterEach(cleanup);

function setup(overrides: Partial<SessionInfo> = {}) {
	const sendInput = vi.fn();
	const interruptSession = vi.fn();
	render(
		<SdkComposer
			session={makeSessionInfo({ sdk: true, ...overrides })}
			sendInput={sendInput}
			interruptSession={interruptSession}
		/>,
	);
	const field = screen.getByLabelText("Message Claude");
	fireEvent.change(field, { target: { value: "run the tests" } });
	return { field, sendInput, interruptSession };
}

describe("SdkComposer", () => {
	it("sends on Enter as one pasted message", () => {
		const { field, sendInput } = setup({ status: "waiting" });
		fireEvent.keyDown(field, { key: "Enter" });
		expect(sendInput).toHaveBeenCalledWith(
			"1",
			bracketedPaste("run the tests"),
		);
	});

	it("stays locked while the conversation resumes", () => {
		const { field, sendInput } = setup({
			status: "waiting",
			sdkResuming: true,
		});
		expect((field as HTMLTextAreaElement).disabled).toBe(true);
		expect(field.getAttribute("placeholder")).toBe("Resuming conversation…");
		fireEvent.keyDown(field, { key: "Enter" });
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("keeps Shift+Enter for a new line", () => {
		const { field, sendInput } = setup({ status: "waiting" });
		fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("hides Stop while waiting", () => {
		setup({ status: "waiting" });
		expect(screen.queryByLabelText("Stop turn")).toBeNull();
	});

	it("stops the turn from Stop or Esc while running", () => {
		const { field, interruptSession } = setup({ status: "running" });
		fireEvent.keyDown(field, { key: "Escape" });
		fireEvent.click(screen.getByLabelText("Stop turn"));
		expect(interruptSession).toHaveBeenCalledTimes(2);
	});

	it("disables Stop until the interrupt lands", () => {
		const { field, interruptSession } = setup({
			status: "running",
			sdkInterrupting: true,
		});
		fireEvent.keyDown(field, { key: "Escape" });
		expect(
			(screen.getByLabelText("Stop turn") as HTMLButtonElement).disabled,
		).toBe(true);
		expect(interruptSession).not.toHaveBeenCalled();
	});
});
