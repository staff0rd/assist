import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { HarnessKind } from "../../../../../../../../../../../shared/harnesses";
import { harnessProductLabel } from "../../../../../../../../../../../shared/harnessLabel";
import { topBarIdSx } from "./topBarIdSx";
import { useCopyFeedback } from "../../../../../../useCopyFeedback";

const buttonSx = {
	...topBarIdSx,
	display: "inline-flex",
	alignItems: "center",
	gap: 0.25,
	borderRadius: 0.5,
	px: 0.25,
} as const;

const glyphSx = { fontSize: "0.875rem" } as const;

function stem(conversationId: string): string {
	const [first = ""] = conversationId.split("-");
	return first === conversationId ? conversationId.slice(0, 8) : first;
}

export function SessionTopBarConversationId({
	conversationId,
	collapsed,
	harness,
}: {
	conversationId: string;
	collapsed: boolean;
	harness?: HarnessKind;
}) {
	const { copied, copy } = useCopyFeedback(conversationId);

	if (!collapsed)
		return (
			<Typography
				sx={{ ...topBarIdSx, userSelect: "all" }}
				title={`${harnessProductLabel(harness)} conversation ${conversationId}`}
			>
				{conversationId}
			</Typography>
		);

	return (
		<ButtonBase
			sx={buttonSx}
			onClick={copy}
			title={
				copied
					? "Copied the full conversation id"
					: `Click to copy the full conversation id ${conversationId}`
			}
		>
			{stem(conversationId)}
			{copied ? <CheckIcon sx={glyphSx} /> : <ContentCopyIcon sx={glyphSx} />}
		</ButtonBase>
	);
}
