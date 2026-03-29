import { describe, expect, it } from "vitest";
import { classifyVerb } from "./classifyVerb";

describe("classifyVerb", () => {
	describe("when given a read verb", () => {
		it("should return r for list", () => {
			expect(classifyVerb("list")).toBe("r");
		});

		it("should return r for show", () => {
			expect(classifyVerb("show")).toBe("r");
		});

		it("should return r for view", () => {
			expect(classifyVerb("view")).toBe("r");
		});
	});

	describe("when given a write verb", () => {
		it("should return w for create", () => {
			expect(classifyVerb("create")).toBe("w");
		});

		it("should return w for delete", () => {
			expect(classifyVerb("delete")).toBe("w");
		});

		it("should return w for deploy", () => {
			expect(classifyVerb("deploy")).toBe("w");
		});
	});

	describe("when given an unknown verb", () => {
		it("should return ?", () => {
			expect(classifyVerb("frobnicate")).toBe("?");
		});
	});

	describe("when given an array of segments", () => {
		describe("when a write verb is present", () => {
			it("should return w", () => {
				expect(classifyVerb(["resource", "create"])).toBe("w");
			});
		});

		describe("when only read verbs are present", () => {
			it("should return r", () => {
				expect(classifyVerb(["list", "export"])).toBe("r");
			});
		});

		describe("when both read and write verbs are present", () => {
			it("should return w (write takes priority)", () => {
				expect(classifyVerb(["list", "delete"])).toBe("w");
			});
		});

		describe("when no known verbs are present", () => {
			it("should return ?", () => {
				expect(classifyVerb(["foo", "bar"])).toBe("?");
			});
		});
	});
});
