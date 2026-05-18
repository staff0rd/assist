import { describe, expect, it } from "vitest";
import { formatToolSummary, simplifyShellCommand } from "./formatToolSummary";

describe("formatToolSummary", () => {
	it("prefers file_path", () => {
		expect(formatToolSummary({ file_path: "src/foo.ts" })).toBe("src/foo.ts");
	});

	it("falls back to path", () => {
		expect(formatToolSummary({ path: "src/foo.ts" })).toBe("src/foo.ts");
	});

	it("truncates long commands", () => {
		const long = "a".repeat(200);
		const result = formatToolSummary({ command: long });
		expect(result.length).toBeLessThanOrEqual(80);
		expect(result.endsWith("…")).toBe(true);
	});

	it("formats pattern with scope", () => {
		expect(formatToolSummary({ pattern: "TODO", path: "src" })).toBe(
			"TODO in src",
		);
	});

	it("returns empty for unknown input shape", () => {
		expect(formatToolSummary({ foo: 1 })).toBe("");
		expect(formatToolSummary(null)).toBe("");
	});
});

describe("simplifyShellCommand", () => {
	it("strips /bin/bash -lc wrapper", () => {
		expect(simplifyShellCommand(`/bin/bash -lc "ls -la"`)).toBe("ls -la");
	});

	it("unescapes inner quotes", () => {
		expect(simplifyShellCommand(`/bin/bash -lc "echo \\"hi\\""`)).toBe(
			`echo "hi"`,
		);
	});

	it("passes through plain commands", () => {
		expect(simplifyShellCommand("ls -la")).toBe("ls -la");
	});

	it("truncates long commands", () => {
		const result = simplifyShellCommand("a".repeat(200));
		expect(result.length).toBeLessThanOrEqual(80);
	});
});
