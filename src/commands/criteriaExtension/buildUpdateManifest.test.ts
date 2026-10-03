import { describe, expect, it } from "vitest";
import { buildUpdateManifest } from "./buildUpdateManifest";

const manifest = JSON.stringify({
	manifest_version: 3,
	version: "1.0.0",
	browser_specific_settings: { gecko: { id: "criteria@example.com" } },
});

describe("buildUpdateManifest", () => {
	it("keys the signed version and its release download by extension id", () => {
		expect(JSON.parse(buildUpdateManifest(manifest, "0.749.0"))).toEqual({
			addons: {
				"criteria@example.com": {
					updates: [
						{
							version: "0.749.0",
							update_link:
								"https://github.com/staff0rd/assist/releases/download/v0.749.0/criteria-extension.xpi",
						},
					],
				},
			},
		});
	});

	it("writes tab-indented json with a trailing newline", () => {
		const updates = buildUpdateManifest(manifest, "0.749.0");
		expect(updates).toContain('\n\t"addons": {');
		expect(updates.endsWith("}\n")).toBe(true);
	});
});
