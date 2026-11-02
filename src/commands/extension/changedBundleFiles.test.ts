import { describe, expect, it } from "vitest";
import { changedBundleFiles } from "./changedBundleFiles";
import { stampManifestVersion } from "./stampManifestVersion";

const manifest = JSON.stringify({ name: "assist", version: "1.0.0" });

function files(entries: Record<string, string>): Map<string, Buffer> {
	return new Map(
		Object.entries(entries).map(([path, text]) => [path, Buffer.from(text)]),
	);
}

const built = files({
	"manifest.json": manifest,
	"content.js": "a()",
	"updates.json": "{}",
});

describe("changedBundleFiles", () => {
	it("is empty when only the stamped version and signature files differ", () => {
		const signed = files({
			"manifest.json": stampManifestVersion(manifest, "0.1045.1"),
			"content.js": "a()",
			"META-INF/mozilla.rsa": "sig",
		});
		expect(changedBundleFiles(built, signed)).toEqual([]);
	});

	it("lists bundled files whose content changed", () => {
		const signed = files({
			"manifest.json": stampManifestVersion(manifest, "0.1045.1"),
			"content.js": "b()",
		});
		expect(changedBundleFiles(built, signed)).toEqual(["content.js"]);
	});

	it("lists manifest changes other than the version", () => {
		const signed = files({
			"manifest.json": JSON.stringify({ name: "other", version: "0.1.0" }),
			"content.js": "a()",
		});
		expect(changedBundleFiles(built, signed)).toEqual(["manifest.json"]);
	});

	it("lists files added to or removed from the bundle", () => {
		const signed = files({
			"manifest.json": manifest,
			"docs.js": "d()",
		});
		expect(changedBundleFiles(built, signed)).toEqual([
			"content.js",
			"docs.js",
		]);
	});
});
