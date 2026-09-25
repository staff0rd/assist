import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { HarnessKind } from "../../../../../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../../../../../shared/harnessLabel";
import { StopCardActivation } from "../../../../../../../StopCardActivation";
import { useCopyFeedback } from "../../../../../../../useCopyFeedback";

export function SessionIdCaption({
	sessionId,
	harness,
}: {
	sessionId: string;
	harness?: HarnessKind;
}) {
	const { copied, copy } = useCopyFeedback(sessionId);

	const onClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		copy();
	};

	return (
		<StopCardActivation>
			<Tooltip
				title={copied ? "Copied!" : `Copy ${harnessLabel(harness)} session id`}
				open={copied || undefined}
			>
				<ButtonBase onClick={onClick} sx={{ borderRadius: 0.5, px: 0.25 }}>
					<Typography
						variant="caption"
						color="text.disabled"
						sx={{ fontFamily: "monospace" }}
					>
						{sessionId.slice(0, 8)}
					</Typography>
				</ButtonBase>
			</Tooltip>
		</StopCardActivation>
	);
}
