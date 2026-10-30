import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInboxIntervalMinutes } from "./readInboxIntervalMinutes";

function globalConfig(yaml: string): string {
	const path = join(mkdtempSync(join(tmpdir(), "inbox-interval-")), "a.yml");
	writeFileSync(path, yaml);
	return path;
}

describe("readInboxIntervalMinutes", () => {
	it("is undefined when the key is unset", () => {
		expect(
			readInboxIntervalMinutes(globalConfig("commit:\n  push: true\n")),
		).toBeUndefined();
	});

	it("reads the interval from the global config", () => {
		expect(
			readInboxIntervalMinutes(globalConfig("inbox:\n  intervalMinutes: 15\n")),
		).toBe(15);
	});

	it("ignores an interval set in a repos override", () => {
		expect(
			readInboxIntervalMinutes(
				globalConfig(
					"repos:\n  - path: /tmp/x\n    inbox:\n      intervalMinutes: 5\n",
				),
			),
		).toBeUndefined();
	});

	it("rejects a non-positive interval", () => {
		expect(() =>
			readInboxIntervalMinutes(globalConfig("inbox:\n  intervalMinutes: 0\n")),
		).toThrow();
	});
});
