import type { z } from "zod";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { resolveSessionTranscript } from "../sessions/shared/resolveSessionTranscript";
import type { gitRefKindSchema } from "./types";

export async function activityLink(
	kind: z.infer<typeof gitRefKindSchema>,
	ref: string,
	options: { title?: string; url?: string },
): Promise<{ title?: string; url?: string }> {
	const transcript =
		kind === "session" ? await resolveSessionTranscript(ref) : undefined;
	return {
		title: options.title ?? transcript?.prompt,
		url:
			options.url ??
			(kind === "branch" || kind === "commit"
				? gitRefUrl(kind, ref)
				: transcript?.path),
	};
}
