import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stageCriteriaExtension } from "./stageCriteriaExtension";

describe("stageCriteriaExtension", () => {
	let dir: string;
	let source: string;
	let staging: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stage-criteria-extension-"));
		source = join(dir, "source");
		staging = join(dir, "staging");
		mkdirSync(source);
		writeFileSync(
			join(source, "manifest.json"),
			JSON.stringify({ manifest_version: 3, version: "1.0.0" }, null, "\t"),
		);
		writeFileSync(join(source, "content.js"), "console.log(1)");
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	function stagedManifest(): { version: string; manifest_version: number } {
		return JSON.parse(
			readFileSync(join(staging, "manifest.json"), "utf8"),
		) as ReturnType<typeof stagedManifest>;
	}

	it("stamps the version into the staged manifest", async () => {
		await stageCriteriaExtension(source, staging, "0.592.1");
		expect(stagedManifest().version).toBe("0.592.1");
	});

	it("leaves the source manifest untouched", async () => {
		await stageCriteriaExtension(source, staging, "0.592.1");
		const original = JSON.parse(
			readFileSync(join(source, "manifest.json"), "utf8"),
		) as { version: string };
		expect(original.version).toBe("1.0.0");
	});

	it("copies the bundled content script", async () => {
		await stageCriteriaExtension(source, staging, "0.592.1");
		expect(readFileSync(join(staging, "content.js"), "utf8")).toBe(
			"console.log(1)",
		);
	});

	it("leaves the update manifest out of the package", async () => {
		writeFileSync(join(source, "updates.json"), "{}");
		await stageCriteriaExtension(source, staging, "0.592.1");
		expect(existsSync(join(staging, "updates.json"))).toBe(false);
	});

	it("clears a stale staging directory", async () => {
		await stageCriteriaExtension(source, staging, "0.592.0");
		writeFileSync(join(staging, "stale.js"), "old");
		await stageCriteriaExtension(source, staging, "0.592.1");
		expect(readFileSync(join(staging, "content.js"), "utf8")).toBe(
			"console.log(1)",
		);
		expect(() => readFileSync(join(staging, "stale.js"), "utf8")).toThrow();
	});
});
