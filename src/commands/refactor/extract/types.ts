import type { FunctionDeclaration, VariableStatement } from "ts-morph";

export type ExtractTarget = FunctionDeclaration | VariableStatement;

export type RequiredImport = {
	moduleSpecifier: string;
	namedImports: string[];
	defaultImport: string | undefined;
	namespaceImport: string | undefined;
	isTypeOnly: boolean;
};
