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
					path: "/staged/u1/shot.png",
					alt: "shot",
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
					path: "/staged/u2/clip.mov",
					alt: "clip",
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
