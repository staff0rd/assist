// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { MarkdownSections } from "./SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewContent/PreviewBody/MarkdownSections";
import { ReviewSynthesisDialog } from "./SessionActionButtons/CardPrActions/ViewReviewButton/ReviewSynthesisDialog";

const content =
	"See [the mock](https://example.com/mock) and [the item](/items/a1006).\n\nSecond paragraph.";

type ColoredOffsets = { start: number; end: number; color: string };

const noRanges: ColoredOffsets[] = [];

function Sections({ ranges = noRanges }: { ranges?: ColoredOffsets[] }) {
	const contentRef = useRef<HTMLDivElement | null>(null);
	return (
		<MarkdownSections
			content={content}
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
