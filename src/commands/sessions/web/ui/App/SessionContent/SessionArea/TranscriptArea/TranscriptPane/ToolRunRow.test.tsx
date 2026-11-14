// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToolRunRow } from "./ToolRunRow";

afterEach(cleanup);

const calls = [
	{ role: "tool" as const, tool: "Bash", target: "ls -la", key: "a" },
	{ role: "tool" as const, tool: "Read", target: "src/x.ts", key: "b" },
];

describe("ToolRunRow", () => {
	it("starts collapsed and toggles the per-call rows", () => {
		render(<ToolRunRow calls={calls} />);
		const button = screen.getByRole("button");
		expect(button.textContent).toContain("2 tool calls · Bash, Read");
		expect(button.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByText("ls -la", { exact: false })).toBeNull();

		fireEvent.click(button);
		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("ls -la", { exact: false })).toBeTruthy();

		fireEvent.click(button);
		expect(screen.queryByText("ls -la", { exact: false })).toBeNull();
	});
});
