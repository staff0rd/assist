import { describe, expect, it } from "vitest";
import { isAllowedLazyImport } from "./isAllowedLazyImport";

// why: built at runtime so the static import check doesn't flag these fixtures
const call = (specifier: string) => `await ${"import"}(${specifier});`;

describe("isAllowedLazyImport", () => {
	it("allows a relative literal import in the CLI entry", () => {
		expect(isAllowedLazyImport("src/index.ts", call('"./runCli"'))).toBe(true);
	});

	it("allows a relative literal import in a register file", () => {
		expect(
			isAllowedLazyImport(
				"src/commands/registerStatusLine.ts",
				call('"./statusLine"'),
			),
		).toBe(true);
	});

	it("rejects a lazy import in any other file", () => {
		expect(
			isAllowedLazyImport("src/commands/statusLine.ts", call('"./x"')),
		).toBe(false);
	});

	it("rejects package and computed specifiers in a register file", () => {
		const file = "src/commands/registerFoo.ts";
		expect(isAllowedLazyImport(file, call('"typescript"'))).toBe(false);
		expect(isAllowedLazyImport(file, call("modulePath"))).toBe(false);
		expect(isAllowedLazyImport(file, `${call('"./a"')} ${call("other")}`)).toBe(
			false,
		);
	});
});
