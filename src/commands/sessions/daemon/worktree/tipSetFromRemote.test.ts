import { describe, expect, it } from "vitest";
import { tipSetFromRemote } from "./tipSetFromRemote";

const remotes = ["origin"];

describe("tipSetFromRemote", () => {
	it.each([
		"branch: Created from origin/feat",
		"branch: Created from refs/remotes/origin/feat",
		"branch: Reset to origin/feat",
		"fetch origin refs/pull/16/head:fix-poll --no-tags: storing ref",
		"clone: from https://example.com/repo.git",
		"pull: Fast-forward",
		"merge origin/feat: Fast-forward",
	])("treats %s as set from the remote", (subject) => {
		expect(tipSetFromRemote(subject, remotes)).toBe(true);
	});

	it.each([
		"branch: Created from HEAD",
		"branch: Created from main",
		"merge local-work: Fast-forward",
		"commit: fix: apply review",
		"pull --rebase (finish): refs/heads/feat onto abc123",
		"rebase (finish): refs/heads/feat onto abc123",
	])("treats %s as a local move", (subject) => {
		expect(tipSetFromRemote(subject, remotes)).toBe(false);
	});
});
