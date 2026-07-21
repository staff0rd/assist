import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export function projectDirForCwd(cwd: string): string {
	return path.join(
		os.homedir(),
		".claude",
		"projects",
		cwd.replace(/[^a-zA-Z0-9]/g, "-"),
	);
}

function transcriptPathFor(cwd: string, claudeSessionId: string): string {
	return path.join(projectDirForCwd(cwd), `${claudeSessionId}.jsonl`);
}

export function findTranscriptPathSync(
	cwd: string,
	claudeSessionId: string,
): string | null {
	const direct = transcriptPathFor(cwd, claudeSessionId);
	if (fs.existsSync(direct)) return direct;

	const dir = projectDirForCwd(cwd);
	let files: string[];
	try {
		files = fs.readdirSync(dir);
	} catch {
		return null;
	}
	for (const file of files) {
		if (!file.endsWith(".jsonl")) continue;
		if (headContainsSessionId(path.join(dir, file), claudeSessionId))
			return path.join(dir, file);
	}
	return null;
}

function headContainsSessionId(
	filePath: string,
	claudeSessionId: string,
): boolean {
	let fd: number | undefined;
	try {
		fd = fs.openSync(filePath, "r");
		const buf = Buffer.alloc(16_384);
		const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
		return buf.toString("utf8", 0, bytesRead).includes(claudeSessionId);
	} catch {
		return false;
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}
