// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

afterEach(cleanup);

describe("ScreenshotThumbnail", () => {
	it("renders an image attachment as an img", () => {
		render(
			<ScreenshotThumbnail
				screenshot={{
					id: 1,
					markdown: "![shot](https://x/y.png)",
					url: "blob:image",
					contentType: "image/png",
				}}
				onRemove={() => {}}
			/>,
		);

		expect(screen.getByAltText("screenshot").tagName).toBe("IMG");
	});

	it("renders a video attachment as a playable video", () => {
		render(
			<ScreenshotThumbnail
				screenshot={{
					id: 1,
					markdown: "https://github.com/user-attachments/assets/9f1c",
					url: "blob:video",
					contentType: "video/quicktime",
				}}
				onRemove={() => {}}
			/>,
		);

		const video = screen.getByLabelText("screenshot");
		expect(video.tagName).toBe("VIDEO");
		expect(video.hasAttribute("controls")).toBe(true);
	});
});
