import { describe, expect, it } from "vitest";
import { rewriteImportPaths } from "./rewriteImportPaths";
import type { RequiredImport } from "./types";

function makeImport(moduleSpecifier: string): RequiredImport {
	return {
		moduleSpecifier,
		namedImports: ["foo"],
		defaultImport: undefined,
		namespaceImport: undefined,
		isTypeOnly: false,
	};
}

describe("rewriteImportPaths", () => {
	describe("when extracting to a subdirectory", () => {
		it("rewrites relative imports for the new location", () => {
			const imports = [makeImport("./backlog")];
			const result = rewriteImportPaths(
				imports,
				"/project/src/commands/registerBacklog.ts",
				"/project/src/commands/backlog/registerItemCommands.ts",
			);
			expect(result[0].moduleSpecifier).toBe("../backlog");
		});
	});

	describe("when extracting to a parent directory", () => {
		it("rewrites relative imports for the new location", () => {
			const imports = [makeImport("../utils")];
			const result = rewriteImportPaths(
				imports,
				"/project/src/commands/foo.ts",
				"/project/src/bar.ts",
			);
			expect(result[0].moduleSpecifier).toBe("./utils");
		});
	});

	describe("when the import is a package (non-relative)", () => {
		it("leaves it unchanged", () => {
			const imports = [makeImport("node:path")];
			const result = rewriteImportPaths(
				imports,
				"/project/src/a.ts",
				"/project/src/sub/b.ts",
			);
			expect(result[0].moduleSpecifier).toBe("node:path");
		});
	});

	describe("when source and destination are in the same directory", () => {
		it("leaves relative imports unchanged", () => {
			const imports = [makeImport("./utils")];
			const result = rewriteImportPaths(
				imports,
				"/project/src/a.ts",
				"/project/src/b.ts",
			);
			expect(result[0].moduleSpecifier).toBe("./utils");
		});
	});
});
