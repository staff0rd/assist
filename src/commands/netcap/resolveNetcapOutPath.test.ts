import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveNetcapOutPath } from "./resolveNetcapOutPath";

describe("resolveNetcapOutPath", () => {
	describe("when no directory is given", () => {
		it("should fall back to the default path under the home directory", () => {
			expect(resolveNetcapOutPath(undefined)).toBe(
				join(homedir(), ".assist", "netcap", "capture.jsonl"),
			);
		});
	});

	describe("when an absolute directory is given", () => {
		it("should place capture.jsonl inside it", () => {
			expect(resolveNetcapOutPath("/var/tmp/caps")).toBe(
				join("/var/tmp/caps", "capture.jsonl"),
			);
		});
	});

	describe("when a relative directory is given", () => {
		it("should resolve it against the working directory", () => {
			const result = resolveNetcapOutPath("caps");
			expect(isAbsolute(result)).toBe(true);
			expect(result).toBe(join(process.cwd(), "caps", "capture.jsonl"));
		});
	});
});
