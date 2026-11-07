import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { rememberSessionTitle } from "./rememberSessionTitle";
import type { Session } from "./types";

export function runSessionTitleGeneration(
	session: Session,
	prompt: string,
	notify: () => void,
	fallback?: string,
): void {
	if (session.generatedTitle || session.titleGenerationStarted) return;
	session.titleGenerationStarted = true;
	const generation = session.harness
		? generateSessionTitle(prompt, session.harness)
		: generateSessionTitle(prompt);
	void generation
		.then((generated) => {
			const title = generated ?? fallback;
			if (!title) {
				daemonLog(
					`session ${session.id} title generation failed; keeping placeholder title`,
				);
				return;
			}
			session.generatedTitle = title;
			daemonLog(
				generated
					? `session ${session.id} generated title: ${generated}`
					: `session ${session.id} title generation failed; falling back to "${title}"`,
			);
			rememberSessionTitle(session);
			notify();
		})
		.catch((error) => {
			daemonLog(`session ${session.id} title generation errored: ${error}`);
		});
}
