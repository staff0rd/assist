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
	it("shows every call's row without a click", () => {
		render(
			<ToolRunRow
				calls={[call("Bash", "ls -la", "a"), call("Edit", "src/d.ts", "b")]}
			/>,
		);
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);
		expect(screen.getByRole("button", { name: /Bash\s*ls$/ })).toBeTruthy();
		expect(screen.getByRole("button", { name: /Edit\s*d\.ts$/ })).toBeTruthy();
		for (const button of buttons)
			expect(button.getAttribute("aria-expanded")).toBe("false");
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
		const line = screen.getByRole("button", { name: /Read\s*a\.ts/ });
		fireEvent.click(line);
		expect(screen.getByText("src/deep/a.ts")).toBeTruthy();
	});

	it("shows a URL target whole as a link, kept out of selection", () => {
		const url = "https://claude.ai/artifact/Wu4fafVRcMMSRtzq3iUCBF";
		render(<ToolRunRow calls={[call("Artifact", url, "a")]} />);
		const link = screen.getByRole("link", { name: url });
		expect(link.getAttribute("href")).toBe(url);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(skipsSelection(link)).toBe(true);
		expect(screen.getByTestId("artifact-icon")).toBeTruthy();
	});

	it("keeps its buttons out of transcript comment selection", () => {
		render(<ToolRunRow calls={[call("Bash", "ls", "a")]} />);
		for (const button of screen.getAllByRole("button"))
			expect(skipsSelection(button)).toBe(true);
	});

	it("labels an Artifact call and lists its input fields on click", () => {
		const typeUrl = "https://claude.ai/artifact/type/abc";
		render(
			<ToolRunRow
				calls={[
					{
						...call("Artifact", "", "a"),
						label: "quickstart · design",
						fields: [
							{ name: "action", value: "quickstart" },
							{ name: "type_url", value: typeUrl },
						],
					},
				]}
			/>,
		);
		const line = screen.getByRole("button", { name: /quickstart · design/ });
		expect(line.hasAttribute("disabled")).toBe(false);
		fireEvent.click(line);
		expect(line.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("action")).toBeTruthy();
		expect(screen.getByText("quickstart")).toBeTruthy();
		const link = screen.getByRole("link", { name: typeUrl });
		expect(link.getAttribute("href")).toBe(typeUrl);
	});

	const artifactUrl = "https://claude.ai/artifact/NmhzhRL5j8sY927Fc1j7es";

	it("links an Artifact row's result URL without toggling, listing it in the dropdown", () => {
		render(
			<ToolRunRow
				calls={[
					{
						...call("Artifact", "", "a"),
						label: "Release plan",
						fields: [{ name: "title", value: "Release plan" }],
						resultUrl: artifactUrl,
					},
				]}
			/>,
		);
		const line = screen.getByRole("button", { name: /Release plan/ });
		const link = screen.getByRole("link", {
			name: "claude.ai/artifact/NmhzhRL5j8sY927Fc1j7es",
		});
		expect(link.getAttribute("href")).toBe(artifactUrl);
		expect(link.getAttribute("target")).toBe("_blank");
		fireEvent.click(link);
		expect(line.getAttribute("aria-expanded")).toBe("false");
		fireEvent.click(line);
		expect(line.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByText("result")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: artifactUrl }).getAttribute("href"),
		).toBe(artifactUrl);
	});

	it("falls back to the Artifact call's input url for its row link", () => {
		render(
			<ToolRunRow
				calls={[
					{
						...call("Artifact", artifactUrl, "a"),
						label: `read · ${artifactUrl}`,
						fields: [
							{ name: "action", value: "read" },
							{ name: "url", value: artifactUrl },
						],
					},
				]}
			/>,
		);
		const link = screen.getByRole("link", {
			name: "claude.ai/artifact/NmhzhRL5j8sY927Fc1j7es",
		});
		expect(link.getAttribute("href")).toBe(artifactUrl);
	});

	it("gives an Artifact row without a result or url no link", () => {
		render(
			<ToolRunRow
				calls={[
					{
						...call("Artifact", "", "a"),
						label: "quickstart · design",
						fields: [{ name: "action", value: "quickstart" }],
					},
				]}
			/>,
		);
		expect(screen.queryByRole("link")).toBeNull();
	});
});
