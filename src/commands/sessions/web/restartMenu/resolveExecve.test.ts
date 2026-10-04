import { describe, expect, it, vi } from "vitest";
import { resolveExecve } from "./resolveExecve";

describe("resolveExecve", () => {
	it("uses execve where the platform supports it", () => {
		const execve = vi.fn();
		expect(resolveExecve("linux", execve)).toBe(execve);
	});

	it("never uses execve on Windows, where Node defines it but it throws", () => {
		expect(resolveExecve("win32", vi.fn())).toBeNull();
	});

	it("falls back when this Node has no execve", () => {
		expect(resolveExecve("darwin", undefined)).toBeNull();
	});
});
