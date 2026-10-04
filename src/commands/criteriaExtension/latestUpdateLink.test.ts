import { describe, expect, it } from "vitest";
import { buildUpdateManifest } from "./buildUpdateManifest";
import { latestUpdateLink } from "./latestUpdateLink";

const manifest = JSON.stringify({
	browser_specific_settings: { gecko: { id: "criteria@example.com" } },
});

describe("latestUpdateLink", () => {
	it("reads the signed release download for the extension id", () => {
		expect(
			latestUpdateLink(manifest, buildUpdateManifest(manifest, "0.749.0")),
		).toBe(
			"https://github.com/staff0rd/assist/releases/download/v0.749.0/criteria-extension.xpi",
		);
	});

	it("is undefined when the update manifest has no entry for the id", () => {
		expect(latestUpdateLink(manifest, '{"addons":{}}')).toBeUndefined();
	});
});
