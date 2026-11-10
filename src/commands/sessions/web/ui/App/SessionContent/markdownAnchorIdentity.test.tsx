// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownSections } from "./PrPreviewSlideInPane/PrPreviewPane/PrPreviewContent/PreviewBody/MarkdownSections";
import { contentText } from "./PrPreviewSlideInPane/PrPreviewPane/usePrComments/loadComments/contentText";
import { ReviewSynthesisDialog } from "./SessionActionButtons/CardPrActions/ViewReviewButton/ReviewSynthesisDialog";

vi.mock(
	"../../../../../backlog/web/ui/components/renderMermaidDiagram",
	() => ({
		renderMermaidDiagram: async (target: HTMLElement) => {
			target.innerHTML =
				'<svg data-testid="diagram"><text>Diagram label</text></svg>';
		},
	}),
);

const content =
	"See [the mock](https://example.com/mock) and [the item](/items/a1006).\n\nSecond paragraph.";

type ColoredOffsets = { start: number; end: number; color: string };

const diagramBody =
	"Before.\n\n```mermaid\ngraph TD\n  A-->B\n```\n\nAfter text";

const noRanges: ColoredOffsets[] = [];

function Sections({
	ranges = noRanges,
	body = content,
}: {
	ranges?: ColoredOffsets[];
	body?: string;
}) {
	const contentRef = useRef<HTMLDivElement | null>(null);
	return (
		<MarkdownSections
			content={body}
			control={null}
			trailing={undefined}
			ranges={ranges}
			contentRef={contentRef}
		/>
	);
}

describe("sessions markdown anchors", () => {
	it("keeps preview anchors across a re-render", () => {
		const { container, rerender } = render(<Sections />);
		const before = container.querySelector("a");
		expect(before).not.toBeNull();
		rerender(<Sections />);
		expect(container.querySelector("a")).toBe(before);
	});

	it("keeps preview anchors when the highlight ranges change", () => {
		const { container, rerender } = render(<Sections />);
		const before = container.querySelector("a");
		expect(before).not.toBeNull();
		rerender(<Sections ranges={[{ start: 0, end: 3, color: "red" }]} />);
		expect(container.querySelector("mark.pr-comment")).not.toBeNull();
		expect(container.querySelector("a")).toBe(before);
		rerender(<Sections />);
		expect(container.querySelector("mark.pr-comment")).toBeNull();
		expect(container.querySelector("a")).toBe(before);
	});

	it("opens external preview links in a new tab and keeps relative ones in place", () => {
		const { container } = render(<Sections />);
		const [external, relative] = [...container.querySelectorAll("a")];
		expect(external?.getAttribute("target")).toBe("_blank");
		expect(external?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(relative?.getAttribute("target")).toBeNull();
		expect(relative?.getAttribute("rel")).toBeNull();
	});

	it("renders a mermaid block as a diagram", async () => {
		const { container } = render(<Sections body={diagramBody} />);
		await waitFor(() =>
			expect(container.querySelector('[data-testid="diagram"]')).not.toBeNull(),
		);
		expect(container.textContent).not.toContain("graph TD");
	});

	it("highlights text after a diagram by offsets that skip the diagram", async () => {
		const { container, rerender } = render(<Sections body={diagramBody} />);
		await waitFor(() =>
			expect(container.querySelector('[data-testid="diagram"]')).not.toBeNull(),
		);
		const text = contentText(container);
		expect(text).not.toContain("Diagram label");
		const start = text.indexOf(" text");
		rerender(
			<Sections
				body={diagramBody}
				ranges={[{ start, end: start + " text".length, color: "red" }]}
			/>,
		);
		expect(container.querySelector("mark.pr-comment")?.textContent).toBe(
			" text",
		);
	});

	it("keeps review synthesis anchors across a re-render", () => {
		const { baseElement, rerender } = render(
			<ReviewSynthesisDialog content={content} onClose={() => {}} />,
		);
		const before = baseElement.querySelector("a");
		expect(before).not.toBeNull();
		rerender(<ReviewSynthesisDialog content={content} onClose={() => {}} />);
		expect(baseElement.querySelector("a")).toBe(before);
	});

	it("opens external review synthesis links in a new tab", () => {
		const { baseElement } = render(
			<ReviewSynthesisDialog content={content} onClose={() => {}} />,
		);
		const [external, relative] = [...baseElement.querySelectorAll("a")];
		expect(external?.getAttribute("target")).toBe("_blank");
		expect(external?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(relative?.getAttribute("target")).toBeNull();
	});
});
