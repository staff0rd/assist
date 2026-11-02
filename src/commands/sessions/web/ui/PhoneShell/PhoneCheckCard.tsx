import Box from "@mui/material/Box";
import { useMemo } from "react";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { checkAnswerDetails } from "../App/SessionContent/PrPreviewSlideInPane/CheckPane/checkAnswerDetails";
import { parseCheckPreview } from "../App/SessionContent/PrPreviewSlideInPane/CheckPane/parseCheckPreview";
import type { QuestionDecision } from "../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionPreview";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneCheckActions } from "./PhoneCheckCard/PhoneCheckActions";
import { PhoneCheckBody } from "./PhoneCheckCard/PhoneCheckBody";

const cardSx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	overscrollBehavior: "contain",
	display: "flex",
	flexDirection: "column",
	gap: 1.75,
	px: 2,
	pt: 1.75,
	bgcolor: "background.paper",
	borderTop: 1,
	borderColor: "divider",
} as const;

export function PhoneCheckCard({
	preview,
	phase,
	keyboardOpen,
	onDecision,
}: {
	preview: PrPreview;
	phase: string | undefined;
	keyboardOpen: boolean;
	onDecision: QuestionDecision;
}) {
	const check = useMemo(() => parseCheckPreview(preview.body), [preview.body]);
	const pb = keyboardOpen ? 1.5 : `calc(${safeAreaInsets.bottom} + 12px)`;

	return (
		<Box sx={{ ...cardSx, pb }} data-testid="phone-check-card">
			<PhoneCheckBody check={check} phase={phase} />
			<Box sx={{ flex: 1 }} />
			<PhoneCheckActions
				laterPhases={check.laterPhases}
				onResult={(result, note, phase) =>
					onDecision("approve", checkAnswerDetails(result, note, phase))
				}
			/>
		</Box>
	);
}
