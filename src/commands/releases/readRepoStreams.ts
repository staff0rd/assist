import { ZodError } from "zod";
import { loadConfig } from "../../shared/loadConfig";
import type { ReleaseStream } from "../../shared/types";

type RepoStreams = { streams: ReleaseStream[] } | { error: string };

export function readRepoStreams(repo: string): RepoStreams {
	try {
		const streams = loadConfig().releases?.streams ?? [];
		const wanted = repo.toLowerCase();
		return { streams: streams.filter((s) => s.repo.toLowerCase() === wanted) };
	} catch (error) {
		return { error: describeConfigError(error) };
	}
}

function describeConfigError(error: unknown): string {
	if (error instanceof ZodError)
		return error.issues
			.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");
	return error instanceof Error ? error.message : String(error);
}
