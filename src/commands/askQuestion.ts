import { randomUUID } from "node:crypto";
import { loadConfig } from "../shared/loadConfig";
import { formatAskQuestionAnswers } from "./askQuestion/formatAskQuestionAnswers";
import { rejectLongQuestions } from "./askQuestion/rejectLongQuestions";
import { readJsonPayload } from "./backlog/readJsonPayload";
import { askQuestionInputSchema } from "./sessions/shared/askQuestionInputSchema";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";
import { isLiveDaemonSession } from "./sessions/shared/isLiveDaemonSession";

function useBuiltIn(reason: string): never {
	console.error(`Error: ${reason}; use the built-in AskUserQuestion tool.`);
	process.exit(1);
}

export async function askQuestion(options: { json: string }): Promise<void> {
	const { questions } = await readJsonPayload(
		options.json,
		askQuestionInputSchema,
		"AskUserQuestion input",
	);
	rejectLongQuestions(questions);
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		useBuiltIn("not running in an assist session");
	if (!loadConfig().sessions?.askQuestion)
		useBuiltIn("assist ask-question is disabled (sessions.askQuestion)");
	if (!(await isLiveDaemonSession(sessionId)))
		useBuiltIn(
			`session ${sessionId} is not live in the assist daemon, so no preview pane can show the form`,
		);

	const title =
		questions.length === 1
			? "Claude is asking a question"
			: `Claude is asking ${questions.length} questions`;
	const decision = await awaitPreviewApproval(
		title,
		{
			sessionId,
			requestId: randomUUID(),
			title,
			body: JSON.stringify({ questions }),
			prNumber: null,
			kind: "question",
		},
		{ rejectIsOutcome: true },
	);

	if (decision.decision === "reject") {
		console.error(
			"The user declined to answer the questions. Do not assume answers; continue without them or ask again in chat if they are essential.",
		);
		process.exit(1);
	}
	console.log(formatAskQuestionAnswers(questions, decision.answers ?? {}));
}
