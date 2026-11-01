import { describe, expect, it } from "vitest";
import { renderScreenshot } from "./renderScreenshot";

describe("renderScreenshot", () => {
	it("renders light and dark images hidden in the other theme", () => {
		expect(
			renderScreenshot(
				{ file: "dash.png", alt: 'The "dashboard"', route: "/sessions" },
				"/assist/",
			),
		).toBe(
			'<figure class="assist-screenshot"><a href="/assist/screenshots/dash.png" target="_blank" title="Open full size" class="dark:sl-hidden"><img src="/assist/screenshots/dash.png" alt="The &quot;dashboard&quot;" loading="lazy"></a><a href="/assist/screenshots/dash-dark.png" target="_blank" title="Open full size" class="light:sl-hidden"><img src="/assist/screenshots/dash-dark.png" alt="The &quot;dashboard&quot;" loading="lazy"></a><figcaption>The &quot;dashboard&quot;</figcaption></figure>',
		);
	});

	it("renders a placeholder for an uncaptured variant", () => {
		expect(
			renderScreenshot(
				{ file: "dash.png", alt: "Dash", route: "/sessions" },
				"/",
				(file) => file === "dash.png",
			),
		).toBe(
			'<figure class="assist-screenshot"><a href="/screenshots/dash.png" target="_blank" title="Open full size" class="dark:sl-hidden"><img src="/screenshots/dash.png" alt="Dash" loading="lazy"></a><div class="assist-screenshot-missing light:sl-hidden">Screenshot not captured yet: dash-dark.png</div><figcaption>Dash</figcaption></figure>',
		);
	});

	it("marks a phone screenshot's figure", () => {
		expect(
			renderScreenshot(
				{ file: "p.png", alt: "P", route: "/", theme: "dark", phone: true },
				"/",
			),
		).toMatch(/^<figure class="assist-screenshot assist-screenshot-phone">/);
	});

	it("renders a themed screenshot as a single image", () => {
		expect(
			renderScreenshot(
				{ file: "a.png", alt: "A", route: "/sessions", theme: "dark" },
				"/",
			),
		).toBe(
			'<figure class="assist-screenshot"><a href="/screenshots/a.png" target="_blank" title="Open full size"><img src="/screenshots/a.png" alt="A" loading="lazy"></a><figcaption>A</figcaption></figure>',
		);
	});
});
