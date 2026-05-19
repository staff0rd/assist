import { describe, expect, it } from "vitest";
import {
	type FailureInput,
	formatReviewerFailure,
} from "./formatReviewerFailure";

function base(overrides: Partial<FailureInput>): FailureInput {
	return {
		name: "codex",
		command: "codex",
		exitCode: 1,
		stderr: "",
		stdout: "",
		elapsedMs: 5000,
		...overrides,
	};
}

describe("formatReviewerFailure", () => {
	it("includes exit code and elapsed seconds in the header", () => {
		const d = formatReviewerFailure(base({ exitCode: 2, elapsedMs: 12345 }));
		expect(d.headerLine).toBe("codex CLI exited with code 2 after 12s");
	});

	it("uses command name when set, otherwise reviewer name", () => {
		const withCommand = formatReviewerFailure(
			base({ name: "synthesis", command: "claude" }),
		);
		expect(withCommand.headerLine).toMatch(/^claude CLI/);
		const withoutCommand = formatReviewerFailure(
			base({ name: "synthesis", command: undefined }),
		);
		expect(withoutCommand.headerLine).toMatch(/^synthesis CLI/);
	});

	it("adds fast-fail hint when elapsedMs is below the threshold", () => {
		const d = formatReviewerFailure(base({ elapsedMs: 200 }));
		const joined = d.detailLines.join("\n");
		expect(joined).toContain("exited almost immediately");
		expect(joined).toContain("`codex --version`");
	});

	it("does not add fast-fail hint for slow failures", () => {
		const d = formatReviewerFailure(base({ elapsedMs: 30000 }));
		const joined = d.detailLines.join("\n");
		expect(joined).not.toContain("exited almost immediately");
	});

	it("does not add fast-fail hint for successful runs", () => {
		const d = formatReviewerFailure(
			base({ exitCode: 0, elapsedMs: 100, stderr: "warn", stdout: "" }),
		);
		expect(d.detailLines.join("\n")).not.toContain("exited almost immediately");
	});

	it("includes stderr indented when present", () => {
		const d = formatReviewerFailure(
			base({ stderr: "boom\nstack trace", elapsedMs: 5000 }),
		);
		expect(d.detailLines).toContain("stderr:");
		expect(d.detailLines).toContain("  boom");
		expect(d.detailLines).toContain("  stack trace");
	});

	it("falls back to stdout tail when stderr is empty", () => {
		const lines = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`);
		const d = formatReviewerFailure(
			base({ stderr: "", stdout: lines.join("\n"), elapsedMs: 5000 }),
		);
		expect(d.detailLines.some((l) => l.startsWith("stdout"))).toBe(true);
		expect(d.detailLines).toContain("  line 30");
		expect(d.detailLines).not.toContain("  line 10");
	});

	it("notes when both stderr and stdout are empty", () => {
		const d = formatReviewerFailure(
			base({ stderr: "", stdout: "", elapsedMs: 5000 }),
		);
		expect(d.detailLines.join(" ")).toContain(
			"No stderr or stdout was captured",
		);
	});

	it("works without elapsedMs (e.g. cached/skipped results)", () => {
		const d = formatReviewerFailure({
			name: "codex",
			command: "codex",
			exitCode: 1,
			stderr: "err",
		});
		expect(d.headerLine).toBe("codex CLI exited with code 1 after 0s");
		expect(d.detailLines.join("\n")).not.toContain("exited almost immediately");
	});
});
