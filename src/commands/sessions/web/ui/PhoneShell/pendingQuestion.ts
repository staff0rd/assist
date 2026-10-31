import { parseQuestionPreview } from "../App/SessionContent/PrPreviewSlideInPane/QuestionPane/parseQuestionPreview";
import type { SessionInfo } from "../types";

export function pendingQuestion(session: SessionInfo) {
	const preview = session.pendingPrPreview;
	if (preview?.kind !== "question") return undefined;
	return parseQuestionPreview(preview.body).length > 0 ? preview : undefined;
}
