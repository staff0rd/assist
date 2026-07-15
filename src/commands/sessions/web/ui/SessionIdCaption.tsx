import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import type { HarnessKind } from "../../../../shared/harnesses";
import { harnessLabel } from "../../../../shared/harnessLabel";
import { StopCardActivation } from "./StopCardActivation";

export function SessionIdCaption({
	sessionId,
	harness,
}: {
	sessionId: string;
	harness?: HarnessKind;
}) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = (e: React.MouseEvent) => {
		e.stopPropagation();
		void navigator.clipboard.writeText(sessionId).then(() => {
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), 1200);
		});
	};

	return (
		<StopCardActivation>
			<Tooltip
				title={copied ? "Copied!" : `Copy ${harnessLabel(harness)} session id`}
				open={copied || undefined}
			>
				<ButtonBase onClick={copy} sx={{ borderRadius: 0.5, px: 0.25 }}>
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
