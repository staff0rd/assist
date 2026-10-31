import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(
	readFileSync("extension/manifest.json", "utf8"),
) as {
	description: string;
	content_scripts: { js: string[] }[];
	content_security_policy?: { extension_pages?: string };
	action?: { default_icon?: unknown; default_popup?: string };
	options_ui?: { open_in_tab?: boolean };
};

describe("extension manifest", () => {
	it("keeps the description within AMO's 250 character limit", () => {
		expect(manifest.description.length).toBeLessThanOrEqual(250);
	});

	it("declares a CSP without upgrade-insecure-requests so the browser link's ws:// socket is not upgraded to wss://", () => {
		const csp = manifest.content_security_policy?.extension_pages;
		expect(csp).toBeDefined();
		expect(csp).not.toContain("upgrade-insecure-requests");
	});

	it("declares a toolbar action without a popup so clicking it fires action.onClicked", () => {
		expect(manifest.action?.default_icon).toBeDefined();
		expect(manifest.action).not.toHaveProperty("default_popup");
	});

	it("opens the options page in its own tab", () => {
		expect(manifest.options_ui?.open_in_tab).toBe(true);
	});

	it("bundles every content script it declares", () => {
		const tsup = readFileSync("tsup.config.ts", "utf8");
		for (const file of manifest.content_scripts.flatMap((s) => s.js))
			expect(tsup).toMatch(
				new RegExp(
					`\\b${file.replace(/\.js$/, "")}:\\s*"src/commands/extension/`,
				),
			);
	});
});
