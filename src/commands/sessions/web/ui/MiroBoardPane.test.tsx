// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MiroItem } from "../../../miro/types";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { MiroBoardPane } from "./MiroBoardPane";

afterEach(cleanup);

function box(id: string, text: string, left: number, top: number): MiroItem {
	return {
		id,
		type: "shape",
		text,
		left,
		top,
		right: left + 200,
		bottom: top + 100,
	};
}

const boxes = [
	box("a", "Alpha", 100, 300),
	box("b", "Beta", 700, 300),
	box("c", "Omega", 1100, 800),
];

const preview: PrPreview = {
	requestId: "r1",
	title: "Pick the top-left then the bottom-right box",
	body: JSON.stringify({ boxes }),
	prNumber: null,
	kind: "miro-board",
};

function paneWith(body = preview.body) {
	const onDecision = vi.fn();
	render(
		<MiroBoardPane preview={{ ...preview, body }} onDecision={onDecision} />,
	);
	return onDecision;
}

const clickBox = (name: string) =>
	fireEvent.click(screen.getByRole("button", { name }));

const extractButton = () =>
	screen.getByRole("button", { name: "Extract boxes" }) as HTMLButtonElement;

describe("MiroBoardPane", () => {
	it("draws every box in the dump to scale", () => {
		paneWith();

		const svg = screen.getByRole("img", { name: "Miro board boxes" });
		expect(svg.getAttribute("viewBox")).toBe("76 276 1248 648");
		expect(svg.querySelectorAll("rect")).toHaveLength(3);
	});

	it("asks for the top-left box first", () => {
		paneWith();

		expect(screen.getByText("Click the top-left box")).toBeTruthy();
		expect(extractButton().disabled).toBe(true);
	});

	it("marks the first click as the top-left anchor", () => {
		paneWith();

		clickBox("Alpha");

		expect(screen.getByText("Now click the bottom-right box")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Alpha (top-left)" }),
		).toBeTruthy();
	});

	it("confirms the pair the user clicked", () => {
		const onDecision = paneWith();

		clickBox("Alpha");
		clickBox("Omega");
		clickBox("Extract boxes");

		expect(onDecision).toHaveBeenCalledWith("approve", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
			draft: false,
			autoMerge: false,
			selection: { topLeft: "a", bottomRight: "c" },
		});
	});

	it("restarts the pair on a third click", () => {
		const onDecision = paneWith();

		clickBox("Alpha");
		clickBox("Omega");
		clickBox("Beta");
		clickBox("Omega");
		clickBox("Extract boxes");

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				selection: { topLeft: "b", bottomRight: "c" },
			}),
		);
	});

	it("clears the pair when the user starts over", () => {
		paneWith();

		clickBox("Alpha");
		clickBox("Start over");

		expect(screen.getByText("Click the top-left box")).toBeTruthy();
		expect(extractButton().disabled).toBe(true);
	});

	it("sends no selection when the pick is cancelled", () => {
		const onDecision = paneWith();

		clickBox("Cancel");

		expect(onDecision).toHaveBeenCalledWith("reject", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
			draft: false,
			autoMerge: false,
		});
	});

	it("draws nothing when the body is not a board dump", () => {
		paneWith("not json");

		expect(
			screen
				.getByRole("img", { name: "Miro board boxes" })
				.querySelectorAll("rect"),
		).toHaveLength(0);
	});
});
