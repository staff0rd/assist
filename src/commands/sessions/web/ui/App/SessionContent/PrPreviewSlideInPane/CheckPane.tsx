import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../../../../../shared/askCheckInputSchema";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../miroDecisionDetails";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { CheckActions } from "./CheckPane/CheckActions";
import { CheckBody } from "./CheckPane/CheckBody";
import { parseCheckPreview } from "./CheckPane/parseCheckPreview";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";

export function CheckPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: PrPreviewPaneProps["onDecision"];
}) {
	const check = useMemo(() => parseCheckPreview(preview.body), [preview.body]);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<CheckBody check={check} />
			<Divider />
			<CheckActions
				onResult={(result, note) =>
					onDecision("approve", {
						...miroDecisionDetails(),
						answers: {
							[CHECK_RESULT_KEY]: result,
							...(note.trim() ? { [CHECK_NOTE_KEY]: note.trim() } : {}),
						},
					})
				}
				onDismiss={() => onDecision("reject", miroDecisionDetails())}
			/>
		</Box>
	);
}
