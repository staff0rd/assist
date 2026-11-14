// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { skipsSelection } from "../../../../textWalker";
import { ToolRunRow } from "./ToolRunRow";

afterEach(cleanup);

const call = (tool: string, target: string, key: string) => ({
	role: "tool" as const,
	tool,
	target,
	key,
});

describe("ToolRunRow", () => {
	it("starts collapsed and toggles the per-call rows", () => {
		render(<ToolRunRow calls={[call("Bash", "ls -la", "a")]} />);
		const button = screen.getByRole("button");
		expect(button.textContent).toContain("1 tool call·Bash");
		expect(button.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByText("ls -la", { exact: false })).toBeNull();

		fireEvent.click(button);
		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("ls -la", { exact: false })).toBeTruthy();

		fireEvent.click(button);
		expect(screen.queryByText("ls -la", { exact: false })).toBeNull();
	});

	it("lists edited then read file names, capped with +N and full path on hover", () => {
		render(
			<ToolRunRow
				calls={[
					call("Read", "src/a.ts", "a"),
					call("Read", "src/b.ts", "b"),
					call("Read", "src/c.ts", "c"),
					call("Read", "src/d.ts", "d"),
					call("Edit", "src/d.ts", "e"),
					call("Bash", "ls", "f"),
					call("Bash", "ls", "g"),
				]}
			/>,
		);
		expect(screen.getByRole("button").textContent).toBe(
			"7 tool calls·EDITEDd.ts·READa.ts, b.ts +1·Bash ×2",
		);
		expect(screen.getByText("a.ts").getAttribute("title")).toBe("src/a.ts");
	});

	it("shows a call's description, revealing its command on click", () => {
		render(
			<ToolRunRow
				calls={[
					{
						...call("Bash", "rm -rf dist", "a"),
						description: "Clean build output",
					},
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button"));
		const line = screen.getByRole("button", { name: /Clean build output/ });
		expect(line.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByText("rm -rf dist")).toBeNull();

		fireEvent.click(line);
		expect(line.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("rm -rf dist")).toBeTruthy();

		fireEvent.click(line);
		expect(screen.queryByText("rm -rf dist")).toBeNull();
	});

	it("names a file tool's file, revealing its full path on click", () => {
		render(<ToolRunRow calls={[call("Read", "src/deep/a.ts", "a")]} />);
		fireEvent.click(screen.getByRole("button"));
		const line = screen.getByRole("button", { name: /Read\s*a\.ts/ });
		fireEvent.click(line);
		expect(screen.getByText("src/deep/a.ts")).toBeTruthy();
	});

	it("keeps its buttons out of transcript comment selection", () => {
		render(<ToolRunRow calls={[call("Bash", "ls", "a")]} />);
		fireEvent.click(screen.getByRole("button"));
		for (const button of screen.getAllByRole("button"))
			expect(skipsSelection(button)).toBe(true);
	});
});
