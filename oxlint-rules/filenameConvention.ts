import { basename } from "node:path";

type FilenameConventionOptions = {
	defaultCase: "export" | "kebab-case";
	kebabBasenames: string[];
	requireAscii: boolean;
};

type AstNode = {
	type: string;
	name?: string;
	value?: string;
	id?: AstNode | null;
	declaration?: AstNode | null;
	declarations?: AstNode[];
	specifiers?: { exported: AstNode }[];
	exported?: AstNode | null;
};

type RuleContext = {
	filename: string;
	options: readonly Partial<FilenameConventionOptions>[];
	report: (diagnostic: {
		loc: { line: number; column: number };
		messageId: string;
		data?: Record<string, string>;
	}) => void;
};

const defaultOptions: FilenameConventionOptions = {
	defaultCase: "export",
	kebabBasenames: [
		"index.ts",
		"shared.ts",
		"types.ts",
		"constants.ts",
		"api.ts",
		"web.ts",
		"tsup.config.ts",
	],
	requireAscii: true,
};

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isAscii = (value: string): boolean => {
	for (const char of value) {
		if ((char.codePointAt(0) ?? 0) > 127) return false;
	}
	return true;
};

const declarationName = (
	declaration: AstNode | null | undefined,
): string | undefined => {
	if (!declaration) return undefined;
	if (declaration.type === "VariableDeclaration") {
		for (const declarator of declaration.declarations ?? []) {
			if (declarator.id?.type === "Identifier") return declarator.id.name;
		}
		return undefined;
	}
	if (declaration.id?.type === "Identifier") return declaration.id.name;
	if (declaration.type === "Identifier") return declaration.name;
	return undefined;
};

const specifierName = (exported: AstNode): string | undefined => {
	if (exported.type === "Identifier") return exported.name;
	if (exported.type === "StringLiteral") return exported.value;
	return undefined;
};

export const filenameConvention = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Enforce filenames match an export name, or kebab-case for shared module files.",
		},
		messages: {
			notAscii: "Filename '{{name}}' should only contain ASCII characters.",
			notKebab: "Filename '{{name}}' should be in kebab-case.",
			notExported:
				"Filename '{{name}}' should match the name of an export in the file.",
		},
		schema: [
			{
				type: "object",
				properties: {
					defaultCase: { type: "string", enum: ["export", "kebab-case"] },
					kebabBasenames: { type: "array", items: { type: "string" } },
					requireAscii: { type: "boolean" },
				},
				additionalProperties: false,
			},
		],
	},
	create(context: RuleContext) {
		const options = { ...defaultOptions, ...context.options[0] };
		const file = basename(context.filename);
		const name = file.split(".")[0] ?? file;
		const exportNames = new Set<string>();

		const report = (messageId: string): void => {
			context.report({
				loc: { line: 1, column: 0 },
				messageId,
				data: { name },
			});
		};

		return {
			ExportNamedDeclaration(node: AstNode) {
				const declared = declarationName(node.declaration);
				if (declared) exportNames.add(declared);
				for (const specifier of node.specifiers ?? []) {
					const exported = specifierName(specifier.exported);
					if (exported) exportNames.add(exported);
				}
			},
			ExportDefaultDeclaration(node: AstNode) {
				const declared = declarationName(node.declaration);
				if (declared) exportNames.add(declared);
			},
			ExportAllDeclaration(node: AstNode) {
				if (node.exported) {
					const exported = specifierName(node.exported);
					if (exported) exportNames.add(exported);
				}
			},
			"Program:exit"() {
				if (options.requireAscii && !isAscii(name)) {
					report("notAscii");
					return;
				}
				const useKebab =
					options.defaultCase === "kebab-case" ||
					options.kebabBasenames.includes(file);
				if (useKebab) {
					if (!kebabCase.test(name)) report("notKebab");
					return;
				}
				if (!exportNames.has(name)) report("notExported");
			},
		};
	},
};

export default {
	meta: { name: "local" },
	rules: { "filename-convention": filenameConvention },
};
