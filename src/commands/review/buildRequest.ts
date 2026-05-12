import { execSync } from "node:child_process";

type ReviewContext = {
	branch: string;
	sha: string;
	shortSha: string;
	baseBranch: string;
	changedFiles: string[];
	diff: string;
};

function detectBaseBranch(): string {
	try {
		const ref = execSync("git rev-parse --abbrev-ref origin/HEAD", {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		const name = ref.replace(/^origin\//, "");
		if (name) return name;
	} catch {
		// fall through
	}
	return "main";
}

export function gatherContext(): ReviewContext {
	const branch = execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf-8",
	}).trim();
	const sha = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
	const shortSha = execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf-8",
	}).trim();
	const baseBranch = detectBaseBranch();
	const range = `${baseBranch}...HEAD`;
	const changedFiles = execSync(`git diff --name-only ${range}`, {
		encoding: "utf-8",
		maxBuffer: 64 * 1024 * 1024,
	})
		.trim()
		.split("\n")
		.filter(Boolean);
	const diff = execSync(`git diff ${range}`, {
		encoding: "utf-8",
		maxBuffer: 256 * 1024 * 1024,
	});
	return { branch, sha, shortSha, baseBranch, changedFiles, diff };
}

function formatFiles(files: string[]): string {
	if (files.length === 0) return "(none)";
	return files.map((file) => `- ${file}`).join("\n");
}

export function buildRequest(context: ReviewContext): string {
	return `# Code review request

- Branch: \`${context.branch}\`
- SHA: \`${context.sha}\`
- Base: \`${context.baseBranch}\`

## Changed files

${formatFiles(context.changedFiles)}

## Diff vs ${context.baseBranch}

\`\`\`diff
${context.diff.trimEnd()}
\`\`\`
`;
}
