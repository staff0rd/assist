import { execFileSync } from "node:child_process";

function gitCheckOutput(args: string[]): string {
	try {
		return execFileSync("git", args, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
	} catch (error) {
		const stdout = (error as { stdout?: string | Buffer }).stdout;
		if (typeof stdout === "string") return stdout;
		return stdout?.toString() ?? "";
	}
}

function checkCommands(files: string[]): string[][] {
	if (files.length === 0) return [["diff", "--cached", "--check"]];
	return [
		["diff", "--check", "--", ...files],
		["diff", "--cached", "--check", "--", ...files],
	];
}

export function findConflictMarkers(files: string[]): string[] {
	const found = new Set<string>();
	for (const args of checkCommands(files)) {
		for (const line of gitCheckOutput(args).split("\n")) {
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
		output = execFileSync("git", ["ls-files", "-u"], {
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
