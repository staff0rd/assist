import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const IMPORT_CALL = "import";

const FILES: Record<string, string> = {
	"tsconfig.json": JSON.stringify({
		compilerOptions: {
			module: "esnext",
			moduleResolution: "bundler",
			target: "es2022",
			strict: true,
			noEmit: true,
		},
		include: ["src", "globals.d.ts"],
	}),
	"globals.d.ts": "declare const vi: { mock(path: string): void };\n",
	"src/app.ts": [
		'import { widget } from "./widget";',
		'import { util } from "./util";',
		"export const app = async () => {",
		`\tconst { lazy } = await ${IMPORT_CALL}("./lazy");`,
		"\treturn widget() + util() + lazy;",
		"};",
		"",
	].join("\n"),
	"src/widget.ts": [
		'import { util } from "./util";',
		'import { widgetPart } from "./widgetPart";',
		"export const widget = () => util() + widgetPart();",
		"",
	].join("\n"),
	"src/widgetPart.ts": [
		'import type { Part } from "./partTypes";',
		"export const widgetPart = (): Part => 1;",
		"",
	].join("\n"),
	"src/partTypes.ts": "export type Part = number;\n",
	"src/util.ts": "export const util = () => 1;\n",
	"src/lazy.ts": "export const lazy = 1;\n",
	"src/widget.test.ts": [
		'import { widget } from "./widget";',
		'vi.mock("./widgetPart");',
		"export const result = widget();",
		"",
	].join("\n"),
	"src/nested/deep/orphan.ts": `export const orphan: ${IMPORT_CALL}("../../partTypes").Part = 1;\n`,
};

export function writeRestructureFixture(dir: string): void {
	for (const [file, content] of Object.entries(FILES)) {
		mkdirSync(dirname(join(dir, file)), { recursive: true });
		writeFileSync(join(dir, file), content);
	}
}
