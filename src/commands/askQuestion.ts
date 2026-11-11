import { randomUUID } from "node:crypto";
import { activeHarness } from "../lib/activeHarness";
import { harnessLabel } from "../shared/harnessAdapters/harnessLabel";
import { formatAskQuestionAnswers } from "./askQuestion/formatAskQuestionAnswers";
import { rejectLongQuestions } from "./askQuestion/rejectLongQuestions";
import { requireQuestionSession } from "./askQuestion/requireQuestionSession";
import { readJsonPayload } from "./backlog/readJsonPayload";
import { askQuestionInputSchema } from "./sessions/shared/askQuestionInputSchema";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";

export async function askQuestion(options: { json: string }): Promise<void> {
	const { questions } = await readJsonPayload(
		options.json,
		askQuestionInputSchema,
		"AskUserQuestion input",
	);
	rejectLongQuestions(questions);
	const sessionId = await requireQuestionSession();

	const agent = harnessLabel(activeHarness());
	const title =
		questions.length === 1
			? `${agent} is asking a question`
			: `${agent} is asking ${questions.length} questions`;
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
