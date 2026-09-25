// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDiffHeader } from "./FileDiffHeader";

afterEach(cleanup);

describe("FileDiffHeader", () => {
	it("omits the preview button when no handler is given", () => {
		render(
			<FileDiffHeader
				path="src/index.ts"
				collapsed={false}
				onToggle={vi.fn()}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Preview rendered markdown" }),
		).toBeNull();
	});

	it("previews without toggling collapse", () => {
		const onToggle = vi.fn();
		const onPreview = vi.fn();
		render(
			<FileDiffHeader
				path="README.md"
				collapsed={false}
				onToggle={onToggle}
				onPreview={onPreview}
			/>,
		);
		const preview = screen.getByRole("button", {
			name: "Preview rendered markdown",
		});
		expect(preview.textContent).toContain("Preview");
		fireEvent.click(preview);
		expect(onPreview).toHaveBeenCalledOnce();
		expect(onToggle).not.toHaveBeenCalled();
	});
});
