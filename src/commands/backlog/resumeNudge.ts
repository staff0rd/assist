import { buildResumePrompt } from "./buildResumePrompt";

export function resumeNudge(): string {
	return process.env.ASSIST_RESUME_IDLE ? "" : buildResumePrompt();
}
