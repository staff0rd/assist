import { randomUUID } from "node:crypto";
import { applyCheckBump } from "./askCheck/applyCheckBump";
import { formatAskCheckAnswer } from "./askCheck/formatAskCheckAnswer";
import { rejectLongCheck } from "./askCheck/rejectLongCheck";
import { requireCheckSession } from "./askCheck/requireCheckSession";
import { resolveCheckBump } from "./askCheck/resolveCheckBump";
import { readJsonPayload } from "./backlog/readJsonPayload";
import {
	askCheckInputSchema,
	CHECK_RESULT_KEY,
} from "./sessions/shared/askCheckInputSchema";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";

export async function askCheck(options: {
	json: string;
	check?: string;
}): Promise<void> {
	const check = await readJsonPayload(
		options.json,
		askCheckInputSchema,
		"manual check",
	);
	rejectLongCheck(check);
	const sessionId = await requireCheckSession();
	const bump = await resolveCheckBump(options.check);

	const decision = await awaitPreviewApproval(
		check.title,
		{
			sessionId,
			requestId: randomUUID(),
			title: check.title,
			body: JSON.stringify(
				bump ? { ...check, laterPhases: bump.laterPhases } : check,
			),
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
	const answers = decision.answers ?? {};
	console.log(
		bump && answers[CHECK_RESULT_KEY] === "later"
			? await applyCheckBump(bump, check.title, answers)
			: formatAskCheckAnswer(check.title, answers),
	);
}
