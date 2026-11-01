import Box from "@mui/material/Box";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import type { QuestionDecision } from "../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionPreview";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { phoneCardSx } from "./phoneCardSx";
import { PhoneQuestionActions } from "./PhoneQuestionCard/PhoneQuestionActions";
import { PhoneQuestionPage } from "./PhoneQuestionCard/PhoneQuestionPage";
import { usePhoneQuestion } from "./PhoneQuestionCard/usePhoneQuestion";

const cardSx = phoneCardSx;

export function PhoneQuestionCard({
	preview,
	keyboardOpen,
	onDecision,
}: {
	preview: PrPreview;
	keyboardOpen: boolean;
	onDecision: QuestionDecision;
}) {
	const model = usePhoneQuestion(preview, onDecision);
	const pb = keyboardOpen ? 1.5 : `calc(${safeAreaInsets.bottom} + 12px)`;

	return (
		<Box sx={{ ...cardSx, pb }} data-testid="phone-question-card">
			<PhoneQuestionPage model={model} />
			<Box sx={{ flex: 1 }} />
			<PhoneQuestionActions {...model.actions} />
		</Box>
	);
}
