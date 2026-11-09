import { awaitsQuestionAnswer } from "../../commands/sessions/shared/awaitsQuestionAnswer";
import { deriveTranscriptStatus } from "../../commands/sessions/shared/deriveTranscriptStatus";
import {
	findTranscriptPathSync,
	projectDirForCwd,
} from "../../commands/sessions/shared/findTranscriptPathSync";
import { transcriptTailFingerprint } from "../../commands/sessions/shared/transcriptTailFingerprint";
import { claudeEntryEvents } from "./claudeEntryEvents";
import type { ConversationReader } from "./types";

export const claudeConversationReader: ConversationReader = {
	headBytes: 65_536,
	locate: ({ cwd, claudeSessionId }) =>
		cwd && claudeSessionId
			? findTranscriptPathSync(cwd, claudeSessionId)
			: null,
	watchTarget: ({ cwd, claudeSessionId }) =>
		cwd && claudeSessionId
			? { dir: projectDirForCwd(cwd), file: `${claudeSessionId}.jsonl` }
			: null,
	events: (entries) => entries.flatMap(claudeEntryEvents),
	lifecycle: (entries, options) => ({
		status: deriveTranscriptStatus(entries, options),
		asking: awaitsQuestionAnswer(entries),
	}),
	fingerprint: transcriptTailFingerprint,
};
