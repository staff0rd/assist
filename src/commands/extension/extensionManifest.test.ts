import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(
	readFileSync("extension/manifest.json", "utf8"),
) as {
	description: string;
	content_scripts: { js: string[] }[];
	content_security_policy?: { extension_pages?: string };
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
