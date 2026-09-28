import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { isReferenceOnlyPrompt } from "../shared/isReferenceOnlyPrompt";
import { sessionTitlePrompt } from "../shared/sessionTitlePrompt";
import { extractContextAfterReference } from "../summarise/extractContextAfterReference";
import { extractFirstUserMessage } from "../summarise/extractFirstUserMessage";
import { daemonLog } from "./daemonLog";
import { runSessionTitleGeneration } from "./runSessionTitleGeneration";
import type { Session } from "./types";

type TitleSource = "first-message" | "after-reference";

export function startTranscriptTitleGeneration(
	session: Session,
	notify: () => void,
): void {
	if (session.generatedTitle || session.titleGenerationStarted) return;

	const source = titleSource(session);
	if (!source) return;

	const filePath = transcriptPath(session);
	if (!filePath) return;

	const context =
		source === "after-reference"
			? extractContextAfterReference(filePath)
			: extractFirstUserMessage(filePath);
	if (!context) return;

	daemonLog(
		source === "after-reference"
			? `session ${session.id} deriving title from transcript context after the reference`
			: `session ${session.id} deriving title from first transcript message`,
	);
	runSessionTitleGeneration(session, context, notify);
}

function titleSource(session: Session): TitleSource | undefined {
	if (session.commandType === "claude" && !session.initialPrompt?.trim())
		return "first-message";
	if (session.activity?.itemName) return undefined;
	const prompt = sessionTitlePrompt(session);
	if (!prompt || !isReferenceOnlyPrompt(prompt)) return undefined;
	return "after-reference";
}

function transcriptPath(session: Session): string | undefined {
	if (session.transcriptPath) return session.transcriptPath;
	if (!session.cwd || !session.claudeSessionId) return undefined;
	return (
		findTranscriptPathSync(session.cwd, session.claudeSessionId) ?? undefined
	);
}
