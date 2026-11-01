import { randomUUID } from "node:crypto";
import { loadConfig } from "../shared/loadConfig";
import { formatAskCheckAnswer } from "./askCheck/formatAskCheckAnswer";
import { rejectLongCheck } from "./askCheck/rejectLongCheck";
import { readJsonPayload } from "./backlog/readJsonPayload";
import { askCheckInputSchema } from "./sessions/shared/askCheckInputSchema";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";
import { isLiveDaemonSession } from "./sessions/shared/isLiveDaemonSession";

function askInChat(reason: string): never {
	console.error(
		`Error: ${reason}; ask the user to perform the check in chat instead.`,
	);
	process.exit(1);
}

export async function askCheck(options: { json: string }): Promise<void> {
	const check = await readJsonPayload(
		options.json,
		askCheckInputSchema,
		"manual check",
	);
	rejectLongCheck(check);
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		askInChat("not running in an assist session");
	if (!loadConfig().sessions?.askQuestion)
		askInChat("assist ask-check is disabled (sessions.askQuestion)");
	if (!(await isLiveDaemonSession(sessionId)))
		askInChat(
			`session ${sessionId} is not live in the assist daemon, so no preview pane can show the check`,
		);

	const decision = await awaitPreviewApproval(
		check.title,
		{
			sessionId,
			requestId: randomUUID(),
			title: check.title,
			body: JSON.stringify(check),
			prNumber: null,
			kind: "check",
		},
		{ rejectIsOutcome: true },
	);

	if (decision.decision === "reject") {
		console.error(
			"The user dismissed the manual check without a result. Do not assume it passed; ask in chat if the result is essential.",
		);
		process.exit(1);
	}
	console.log(formatAskCheckAnswer(check.title, decision.answers ?? {}));
}
