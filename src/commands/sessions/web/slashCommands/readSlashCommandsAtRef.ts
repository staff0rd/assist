import { splitFrontmatter } from "../../../sync/splitFrontmatter";
import { gitOrNull } from "../../daemon/worktree/git";
import { mergeSlashCommands, type SlashEntry } from "./mergeSlashCommands";
import type { SlashCommand } from "./readSlashCommands";

async function describeAt(
	repo: string,
	ref: string,
	file: string,
): Promise<string | undefined> {
	const content = await gitOrNull(repo, ["show", `${ref}:${file}`]);
	return content ? splitFrontmatter(content).description : undefined;
}

async function entriesMatching(
	repo: string,
	ref: string,
	files: string[],
	pattern: RegExp,
): Promise<SlashEntry[]> {
	const matched = files.flatMap((file) => {
		const name = pattern.exec(file)?.[1];
		return name ? [{ name, file }] : [];
	});
	return Promise.all(
		matched.map(async ({ name, file }) => ({
			name,
			description: await describeAt(repo, ref, file),
		})),
	);
}

export async function readSlashCommandsAtRef(
	repo: string,
	ref: string,
	scope: SlashCommand["scope"],
	projectDir = ".claude",
): Promise<SlashCommand[] | null> {
	if (!(await gitOrNull(repo, ["rev-parse", "--verify", "--quiet", ref])))
		return null;
	const listing = await gitOrNull(repo, [
		"ls-tree",
		"-r",
		"--full-tree",
		"--name-only",
		ref,
		"--",
		`${projectDir}/commands`,
		`${projectDir}/skills`,
	]);
	const files = listing ? listing.split("\n") : [];
	const dir = projectDir.replaceAll(".", String.raw`\.`);
	const command = new RegExp(`^${dir}/commands/([^/]+)\\.md$`);
	const skill = new RegExp(`^${dir}/skills/([^/]+)/SKILL\\.md$`);
	return mergeSlashCommands(
		await entriesMatching(repo, ref, files, command),
		await entriesMatching(repo, ref, files, skill),
		scope,
	);
}
