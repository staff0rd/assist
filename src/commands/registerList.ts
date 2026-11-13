import type { Command } from "commander";
type ListOptions = {
	status?: string;
	all?: boolean;
	allRepos?: boolean;
	verbose?: boolean;
	dir?: string;
};

export function registerList(program: Command): void {
	program
		.command("list")
		.alias("ls")
		.description("Alias for backlog list")
		.option(
			"--status <type>",
			"Filter by status (todo, in-progress, done, wontdo)",
		)
		.option("-a, --all", "Include done/wontdo items")
		.option("--all-repos", "List items across all repositories")
		.option("-v, --verbose", "Show all item details")
		.option("--dir <path>", "Override directory for backlog file discovery")
		.action(async (options: ListOptions) => {
			const { list: backlogList } = await import("./backlog/list");
			const { setBacklogDir } = await import("./backlog/getBacklogDir");
			setBacklogDir(options.dir);
			return backlogList(options);
		});
}
