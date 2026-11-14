import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { claudeMdRuleScopes } from "./claudeMdRuleScopes";

const root = mkdtempSync(join(tmpdir(), "assist-rule-scopes-"));
for (const dir of ["docs", "docs/deep", "src/ui", "plain"])
	mkdirSync(join(root, dir), { recursive: true });
writeFileSync(
	join(root, "CLAUDE.md"),
	"# Root\n\n## Rules\n\n- **R1** — **Tight** — Keep it tight\n",
);
writeFileSync(join(root, "docs", "CLAUDE.md"), "## Rules\n\n");
writeFileSync(
	join(root, "docs", "deep", "CLAUDE.md"),
	"## Rules\n\n- **R2** — Name it\n",
);
writeFileSync(
	join(root, "src", "ui", "CLAUDE.md"),
	"## Rules\n\n- **R3** — Theme\n",
);
writeFileSync(join(root, "plain", "CLAUDE.md"), "# No rules here\n");

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("claudeMdRuleScopes", () => {
	const scopes = claudeMdRuleScopes(root);

	it("lists each CLAUDE.md with a Rules section, sorted by directory", () => {
		expect(scopes.map((scope) => scope.name)).toEqual([
			"CLAUDE.md",
			"docs/CLAUDE.md",
			"docs/deep/CLAUDE.md",
			"src/ui/CLAUDE.md",
		]);
	});

	it("nests each scope under the scopes whose directory contains it", () => {
		expect(scopes.map((scope) => scope.depth)).toEqual([0, 1, 2, 1]);
	});

	it("parses each scope's rules", () => {
		expect(scopes[0].rules).toEqual([
			{ code: "R1", title: "Tight", text: "Keep it tight" },
		]);
		expect(scopes[1].rules).toEqual([]);
		expect(scopes[2].dir).toBe("docs/deep/");
	});
});
