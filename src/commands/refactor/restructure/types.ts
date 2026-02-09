export type ImportEdge = {
	source: string;
	target: string;
	specifier: string;
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
	moves: FileMove[];
	rewrites: ImportRewrite[];
	newDirectories: string[];
	warnings: string[];
};
