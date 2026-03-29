export type RequiredImport = {
	moduleSpecifier: string;
	namedImports: string[];
	defaultImport: string | undefined;
	namespaceImport: string | undefined;
	isTypeOnly: boolean;
};
