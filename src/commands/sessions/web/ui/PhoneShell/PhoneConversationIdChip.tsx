import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { Theme } from "@mui/material/styles";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { useCopyFeedback } from "../App/useCopyFeedback";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";

const chipSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.625,
	px: 0.75,
	py: 0.25,
	borderRadius: 0.75,
	bgcolor: raisedBgcolor,
	fontFamily: "fontFamilyMono",
	fontSize: 12,
	color: "text.secondary",
} as const;

const copiedSx = { color: "success.main" } as const;

const labelSx = {
	fontFamily: (t: Theme) => t.typography.fontFamily,
	color: "text.disabled",
} as const;

export function PhoneConversationIdChip({
	conversationId,
	harness,
}: {
	conversationId: string;
	harness?: HarnessKind;
}) {
	const { copied, copy } = useCopyFeedback(conversationId);
	const label = harnessLabel(harness);
	const short = conversationId.slice(0, 8);
	return (
		<ButtonBase
			sx={[chipSx, copied && copiedSx]}
			onClick={(e) => {
				e.stopPropagation();
				copy();
			}}
			aria-label={
				copied
					? `Copied ${label} session id`
					: `Copy ${label} session id ${short}`
			}
		>
			<Box component="span" sx={labelSx}>
				{copied ? "Copied" : label}
			</Box>
			{short}
		</ButtonBase>
	);
}
