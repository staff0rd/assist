import { useState } from "react";
import type { QuestionDecision } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionPreview";

export function usePhoneDecision(onDecision: QuestionDecision) {
	const [sending, setSending] = useState(false);
	const [unsent, setUnsent] = useState(false);

	const decide: QuestionDecision = (decision, details) => {
		const sent = onDecision(decision, details) !== false;
		setSending(sent);
		setUnsent(!sent);
		return sent;
	};

	return { decide, sending, unsent };
}
