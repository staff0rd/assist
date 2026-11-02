import * as fs from "node:fs";
import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { execGit } from "./execGit";
import { parseTranscriptCommitShas } from "./parseTranscriptCommitShas";

async function headCommit(
	cwd: string,
	sha: string,
): Promise<string | undefined> {
	try {
		const full = (
			await execGit(cwd, [
				"rev-parse",
				"--verify",
				"--quiet",
				`${sha}^{commit}`,
			])
		).trim();
		await execGit(cwd, ["merge-base", "--is-ancestor", full, "HEAD"]);
		return full;
	} catch {
		return undefined;
	}
}

export async function transcriptCommits(
	cwd: string,
	sessionId: string,
): Promise<CommitRef[]> {
	const transcriptPath = findTranscriptPathSync(cwd, sessionId);
	if (!transcriptPath) return [];
	let transcript: string;
	try {
		transcript = await fs.promises.readFile(transcriptPath, "utf8");
	} catch {
		return [];
	}
	const shas: string[] = [];
	for (const sha of parseTranscriptCommitShas(transcript)) {
		const full = await headCommit(cwd, sha);
		if (full && !shas.includes(full)) shas.push(full);
	}
	return shas.map((sha) => ({ sha }));
}
