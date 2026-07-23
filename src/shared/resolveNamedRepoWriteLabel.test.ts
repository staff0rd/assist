import { describe, expect, it } from "vitest";
import {
	resolveNamedRepoWriteLabel,
	UnknownRepoConfigError,
} from "./resolveNamedRepoWriteLabel";
import { AmbiguousRepoConfigError } from "./resolveRepoOverride";

describe("resolveNamedRepoWriteLabel", () => {
	it("matches a bare repo name against its stored key", () => {
		const globalRaw = { repos: { assist: { commit: { push: true } } } };
		expect(resolveNamedRepoWriteLabel(globalRaw, "assist")).toBe("assist");
	});

	it("matches an org/repo name against a bare key", () => {
		const globalRaw = { repos: { assist: { commit: { push: true } } } };
		expect(resolveNamedRepoWriteLabel(globalRaw, "org/assist")).toBe("assist");
	});

	it("matches a full origin name against an org/repo key", () => {
		const globalRaw = { repos: { "org/assist": { commit: { push: true } } } };
		expect(resolveNamedRepoWriteLabel(globalRaw, "github.com/org/assist")).toBe(
			"org/assist",
		);
	});

	it("throws when no key matches the supplied name", () => {
		const globalRaw = { repos: { assist: { commit: { push: true } } } };
		expect(() => resolveNamedRepoWriteLabel(globalRaw, "planner")).toThrow(
			UnknownRepoConfigError,
		);
	});

	it("throws when there is no repos block", () => {
		expect(() => resolveNamedRepoWriteLabel({}, "assist")).toThrow(
			UnknownRepoConfigError,
		);
	});

	it("throws when multiple keys match the supplied name", () => {
		const globalRaw = {
			repos: {
				assist: { commit: { push: true } },
				"org/assist": { commit: { push: false } },
			},
		};
		expect(() =>
			resolveNamedRepoWriteLabel(globalRaw, "github.com/org/assist"),
		).toThrow(AmbiguousRepoConfigError);
	});
});
