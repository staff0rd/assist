import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";

function gitCheckOutput(cmd: string): string {
	try {
		return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
	} catch (error) {
		const stdout = (error as { stdout?: string | Buffer }).stdout;
		if (typeof stdout === "string") return stdout;
		return stdout?.toString() ?? "";
	}
}

function checkCommands(files: string[]): string[] {
	if (files.length === 0) return ["git diff --cached --check"];
	const scope = files.map(shellQuote).join(" ");
	return [
		`git diff --check -- ${scope}`,
		`git diff --cached --check -- ${scope}`,
	];
}

export function findConflictMarkers(files: string[]): string[] {
	const found = new Set<string>();
	for (const cmd of checkCommands(files)) {
		for (const line of gitCheckOutput(cmd).split("\n")) {
			if (!line.includes("leftover conflict marker")) continue;
			const file = line.slice(0, line.indexOf(":"));
			if (file) found.add(file);
		}
	}
	return [...found];
}

export function findUnmergedPaths(): string[] {
	let output: string;
	try {
		output = execSync("git ls-files -u", {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
	} catch {
		return [];
	}
	const found = new Set<string>();
	for (const line of output.split("\n")) {
		const path = line.split("\t")[1];
		if (path) found.add(path.trim());
	}
	return [...found];
}
