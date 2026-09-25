export type ImportEdge = {
	source: string;
	target: string;
	specifier: string;
	mock?: boolean;
};

export type ImportGraph = {
	files: Set<string>;
	edges: ImportEdge[];
	importedBy: Map<string, Set<string>>;
	imports: Map<string, Set<string>>;
};

export type FileMove = {
	from: string;
	to: string;
	reason: string;
};

export type ImportRewrite = {
	file: string;
	oldSpecifier: string;
	newSpecifier: string;
};

export type RestructurePlan = {
	scopeRoot: string;
	targets: Map<string, string>;
	moves: FileMove[];
	rewrites: ImportRewrite[];
	errors: string[];
};
