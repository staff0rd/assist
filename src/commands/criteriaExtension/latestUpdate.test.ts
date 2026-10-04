import { describe, expect, it } from "vitest";
import { buildUpdateManifest } from "./buildUpdateManifest";
import { latestUpdate } from "./latestUpdate";

const manifest = JSON.stringify({
	browser_specific_settings: { gecko: { id: "criteria@example.com" } },
});

describe("latestUpdate", () => {
	it("reads the last signed version for the extension id", () => {
		expect(
			latestUpdate(manifest, buildUpdateManifest(manifest, "0.749.0"))?.version,
		).toBe("0.749.0");
	});

	it("is undefined when the update manifest has no entry for the id", () => {
		expect(latestUpdate(manifest, '{"addons":{}}')).toBeUndefined();
	});
});
