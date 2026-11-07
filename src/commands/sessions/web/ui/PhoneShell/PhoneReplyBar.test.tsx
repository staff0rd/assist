// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PhoneReplyBar } from "./PhoneReplyBar";

afterEach(cleanup);

describe("PhoneReplyBar", () => {
	it("addresses Claude when the session has no harness", () => {
		render(<PhoneReplyBar onSend={() => {}} />);
		expect(screen.getByPlaceholderText("Reply to Claude…")).toBeTruthy();
	});

	it("addresses the session's harness", () => {
		render(<PhoneReplyBar harness="codex" onSend={() => {}} />);
		expect(screen.getByPlaceholderText("Reply to Codex…")).toBeTruthy();
	});
});
