import { resolveBaseRepo } from "../prs/resolveBaseRepo";
import { azureDevopsRemote } from "./azureDevopsRemote";

type CliCommand = { file: string; args: string[] };

export type PrCliCommands = {
	headBranch: CliCommand & { parse: (stdout: string) => string | null };
	checkout: CliCommand;
};

const HEADS = "refs/heads/";

function branchFromRef(stdout: string): string | null {
	const ref = stdout.trim();
	return (ref.startsWith(HEADS) ? ref.slice(HEADS.length) : ref) || null;
}

function baseRepoArgs(cwd: string): string[] {
	const base = resolveBaseRepo(undefined, cwd)?.base;
	return base ? ["-R", `${base.org}/${base.repo}`] : [];
}

function ghCommands(number: string, cwd: string): PrCliCommands {
	const repo = baseRepoArgs(cwd);
	return {
		headBranch: {
			file: "gh",
			args: [
				"pr",
				"view",
				number,
				"--json",
				"headRefName",
				"-q",
				".headRefName",
				...repo,
			],
			parse: (stdout) => stdout.trim() || null,
		},
		checkout: { file: "gh", args: ["pr", "checkout", number, ...repo] },
	};
}

export function prCliCommands(number: string, cwd: string): PrCliCommands {
	const azure = azureDevopsRemote(cwd);
	if (!azure) return ghCommands(number, cwd);
	return {
		headBranch: {
			file: "az",
			args: [
				"repos",
				"pr",
				"show",
				"--id",
				number,
				"--org",
				`https://dev.azure.com/${azure.org}`,
				"--query",
				"sourceRefName",
				"-o",
				"tsv",
			],
			parse: branchFromRef,
		},
		checkout: { file: "az", args: ["repos", "pr", "checkout", "--id", number] },
	};
}
