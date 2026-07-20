import { describe, expect, it } from "vitest";
import { originToSshUrl } from "./originToSshUrl";

describe("originToSshUrl", () => {
	it("reconstructs an SSH URL from a host/org/repo origin", () => {
		expect(originToSshUrl("github.com/org/repo")).toBe(
			"git@github.com:org/repo.git",
		);
	});

	it("preserves nested group paths", () => {
		expect(originToSshUrl("gitlab.com/group/sub/repo")).toBe(
			"git@gitlab.com:group/sub/repo.git",
		);
	});

	it("rejects local: origins", () => {
		expect(originToSshUrl("local:/home/user/repo")).toBeNull();
	});

	it("returns null when there is no path segment", () => {
		expect(originToSshUrl("github.com")).toBeNull();
	});

	it("returns null when the host is empty", () => {
		expect(originToSshUrl("/org/repo")).toBeNull();
	});
});
