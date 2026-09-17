import { describe, expect, it } from "vitest";
import { describeFetchError } from "./describeFetchError";

function errorWithStderr(message: string, stderr: string | Uint8Array) {
	return Object.assign(new Error(message), { stderr });
}

describe("describeFetchError", () => {
	it("names a missing gh install", () => {
		expect(describeFetchError(new Error("spawnSync gh ENOENT"))).toBe(
			"GitHub CLI (gh) is not installed — see https://cli.github.com/",
		);
	});

	it("reports the first line of stderr", () => {
		expect(
			describeFetchError(
				errorWithStderr("Command failed", "\nGraphQL: Could not resolve\nmore"),
			),
		).toBe("GraphQL: Could not resolve");
	});

	it("decodes stderr captured as bytes", () => {
		expect(
			describeFetchError(
				errorWithStderr("Command failed", Buffer.from("HTTP 404\n")),
			),
		).toBe("HTTP 404");
	});

	it("falls back to the error message", () => {
		expect(
			describeFetchError(new Error("unexpected response from gh pr list")),
		).toBe("unexpected response from gh pr list");
	});

	it("stringifies a non-error", () => {
		expect(describeFetchError("boom")).toBe("boom");
	});
});
