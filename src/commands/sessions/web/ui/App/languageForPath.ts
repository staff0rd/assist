const EXTENSION_LANGUAGE: Record<string, string> = {
	ts: "typescript",
	mts: "typescript",
	cts: "typescript",
	tsx: "tsx",
	js: "tsx",
	jsx: "tsx",
	mjs: "tsx",
	cjs: "tsx",
	json: "json",
	css: "css",
	py: "python",
	md: "markdown",
	markdown: "markdown",
	yml: "yaml",
	yaml: "yaml",
	sh: "bash",
	bash: "bash",
	html: "markup",
	htm: "markup",
	xml: "markup",
	svg: "markup",
	graphql: "graphql",
	graphqls: "graphql",
	gql: "graphql",
	cs: "csharp",
	csx: "csharp",
	cshtml: "cshtml",
	razor: "cshtml",
	sql: "sql",
	ps1: "powershell",
	psm1: "powershell",
	psd1: "powershell",
	dockerfile: "docker",
	toml: "toml",
	ini: "ini",
	env: "ini",
	editorconfig: "ini",
	go: "go",
	rs: "rust",
	swift: "swift",
	kt: "kotlin",
	kts: "kotlin",
	java: "java",
	bicep: "bicep",
	tf: "hcl",
	tfvars: "hcl",
	hcl: "hcl",
	diff: "diff",
	patch: "diff",
};

export function languageForPath(path: string): string | undefined {
	const basename = path.split(/[\\/]/).pop()?.toLowerCase() ?? "";
	const byName = languageForBasename(basename);
	if (byName) return byName;
	const dot = basename.lastIndexOf(".");
	return dot !== -1 ? EXTENSION_LANGUAGE[basename.slice(dot + 1)] : undefined;
}

function languageForBasename(basename: string): string | undefined {
	if (basename === "dockerfile" || basename.startsWith("dockerfile.")) {
		return "docker";
	}
	if (basename === ".env" || basename.startsWith(".env.")) return "ini";
	return undefined;
}
