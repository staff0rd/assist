// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShowPane } from "./ShowPane";

vi.mock(
	"../../../../../backlog/web/ui/components/renderMermaidDiagram",
	() => ({
		renderMermaidDiagram: async (target: HTMLElement) => {
			target.innerHTML = '<svg data-testid="diagram"></svg>';
		},
	}),
);
import { PreviewWidthContext } from "./usePreviewWidthContext";

const preview = {
	requestId: "req-1",
	title: "Links",
	body: "See [the docs](https://example.com/a/very/long/path) and `src/deep/file.ts`\n\n```ts\nconst x = 1;\n```",
	prNumber: null,
	kind: "show" as const,
};

afterEach(cleanup);

describe("ShowPane", () => {
	it("renders links that open in a new tab", () => {
		render(<ShowPane preview={preview} onClose={vi.fn()} />);

		const link = screen.getByText("the docs");
		expect(link.getAttribute("href")).toBe(
			"https://example.com/a/very/long/path",
		);
		expect(link.getAttribute("target")).toBe("_blank");
	});

	it("renders code and paths", () => {
		render(<ShowPane preview={preview} onClose={vi.fn()} />);

		expect(screen.getByText("src/deep/file.ts")).toBeTruthy();
		expect(screen.getByText("const x = 1;")).toBeTruthy();
	});

	it("offers only a Close action beside the copy buttons", () => {
		const onClose = vi.fn();
		render(<ShowPane preview={preview} onClose={onClose} />);

		const actions = screen
			.getAllByRole("button")
			.filter((b) => b.getAttribute("aria-label") !== "Copy");
		expect(actions).toHaveLength(1);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onClose).toHaveBeenCalled();
	});

	it("copies inline and fenced code to the clipboard", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});
		render(<ShowPane preview={preview} onClose={vi.fn()} />);

		const copies = screen.getAllByRole("button", { name: "Copy" });
		expect(copies).toHaveLength(2);
		fireEvent.click(copies[0]);
		fireEvent.click(copies[1]);

		expect(writeText).toHaveBeenNthCalledWith(1, "src/deep/file.ts");
		expect(writeText).toHaveBeenNthCalledWith(2, "const x = 1;");
	});
});

describe("ShowPane mermaid", () => {
	const mermaidPreview = {
		...preview,
		body: "```mermaid\nflowchart LR\n  A --> B\n```\n\n```sh\nls\n```",
	};

	it("renders a mermaid block as a diagram without a copy button", async () => {
		const { container } = render(
			<ShowPane preview={mermaidPreview} onClose={vi.fn()} />,
		);

		const diagram = await screen.findByTestId("diagram");
		expect(diagram.closest(".mermaid-diagram")).toBeTruthy();
		expect(container.textContent).not.toContain("flowchart LR");
		expect(container.querySelector(".mermaid-diagram .copy-code")).toBeNull();
	});

	it("keeps copy buttons on other code blocks", () => {
		render(<ShowPane preview={mermaidPreview} onClose={vi.fn()} />);

		const copies = screen.getAllByRole("button", { name: "Copy" });
		expect(copies).toHaveLength(1);
		expect(copies[0].dataset.copy).toBe("ls");
	});
});

describe("ShowPane width toggle", () => {
	it("asks the split to fill the window", () => {
		const onToggleMode = vi.fn();
		render(
			<PreviewWidthContext.Provider
				value={{ mode: "half", full: false, onToggleMode }}
			>
				<ShowPane preview={preview} onClose={vi.fn()} />
			</PreviewWidthContext.Provider>,
		);

		fireEvent.click(screen.getByLabelText("Fill the window with preview"));
		expect(onToggleMode).toHaveBeenCalled();
	});
});
