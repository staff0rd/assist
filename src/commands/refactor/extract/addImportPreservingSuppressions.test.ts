import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { addImportPreservingSuppressions } from "./addImportPreservingSuppressions";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

describe("addImportPreservingSuppressions", () => {
	it("inserts the import below a leading oxlint-disable comment", () => {
		const sf =
			createSourceFile(`// oxlint-disable react-hooks/exhaustive-deps -- stable identity
const OFF = 0;
export function thrust() { return lerp(OFF, 1, 0.5); }
`);
		addImportPreservingSuppressions(sf, {
			moduleSpecifier: "./lerp",
			namedImports: ["lerp"],
		});
		const lines = sf.getFullText().split("\n");
		expect(lines[0]).toBe(
			"// oxlint-disable react-hooks/exhaustive-deps -- stable identity",
		);
		expect(lines[1]).toBe('import { lerp } from "./lerp";');
	});

	it("inserts below multiple leading suppression comments", () => {
		const sf =
			createSourceFile(`// oxlint-disable lint/style/useFilenamingConvention -- data file
// oxlint-disable lint/suspicious/noExplicitAny -- generated
const OFF = 0;
`);
		addImportPreservingSuppressions(sf, {
			moduleSpecifier: "./lerp",
			namedImports: ["lerp"],
		});
		const lines = sf.getFullText().split("\n");
		expect(lines[2]).toBe('import { lerp } from "./lerp";');
	});

	it("inserts at the top when there is no suppression comment", () => {
		const sf = createSourceFile(`const OFF = 0;
`);
		addImportPreservingSuppressions(sf, {
			moduleSpecifier: "./lerp",
			namedImports: ["lerp"],
		});
		expect(sf.getFullText().split("\n")[0]).toBe(
			'import { lerp } from "./lerp";',
		);
	});

	it("does not treat a leading non-suppression comment as a suppression", () => {
		const sf = createSourceFile(`// plain header comment
const OFF = 0;
`);
		addImportPreservingSuppressions(sf, {
			moduleSpecifier: "./lerp",
			namedImports: ["lerp"],
		});
		expect(sf.getFullText().split("\n")[0]).toBe(
			'import { lerp } from "./lerp";',
		);
	});

	it("appends after existing imports below a suppression comment", () => {
		const sf =
			createSourceFile(`// oxlint-disable lint/style/useFilenamingConvention -- data definition file
import { other } from "./other";
const OFF = other;
`);
		addImportPreservingSuppressions(sf, {
			moduleSpecifier: "./lerp",
			namedImports: ["lerp"],
		});
		const lines = sf.getFullText().split("\n");
		expect(lines[0]).toBe(
			"// oxlint-disable lint/style/useFilenamingConvention -- data definition file",
		);
		expect(lines[1]).toBe('import { other } from "./other";');
		expect(lines[2]).toBe('import { lerp } from "./lerp";');
	});
});
