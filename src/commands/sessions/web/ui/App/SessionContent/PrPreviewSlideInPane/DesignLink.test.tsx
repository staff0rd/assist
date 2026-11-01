// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { PrPreviewPane } from "./PrPreviewPane";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

const url = "https://claude.ai/artifact/abc123";

const preview: PrPreview = {
	requestId: "r1",
	title: "Inbox redesign",
	body: "Two-column layout with a sticky filter bar.",
	prNumber: null,
	kind: "design",
	metadata: [{ label: "Design", value: url, url }],
};

describe("design review pane", () => {
	it("leads with an Open design link to the artifact", () => {
		render(<PrPreviewPane preview={preview} onDecision={vi.fn()} />);

		const link = screen.getByRole("link", { name: /Open design/ });
		expect(link.getAttribute("href")).toBe(url);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(screen.getByText("Design")).toBeTruthy();
		expect(screen.getByText(/sticky filter bar/)).toBeTruthy();
	});

	it("approves and rejects like a sign-off", () => {
		const onDecision = vi.fn();
		render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenLastCalledWith(
			"approve",
			expect.objectContaining({ comments: [] }),
		);

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenLastCalledWith(
			"reject",
			expect.objectContaining({ comments: [] }),
		);
	});
});
