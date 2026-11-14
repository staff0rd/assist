import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { type ReactNode, useState } from "react";
import { CallHead } from "./CallHead";
import { callRowSx } from "./callRowSx";
import { RevealedTarget } from "./RevealedTarget";

export function RevealRow({
	tool,
	target,
	description,
	label,
}: {
	tool: string;
	target: string;
	description?: string;
	label: ReactNode;
}) {
	const [revealed, setRevealed] = useState(false);
	return (
		<Box>
			<ButtonBase
				data-preview-skip
				aria-expanded={revealed}
				disabled={!target}
				onClick={() => setRevealed((r) => !r)}
				sx={callRowSx}
			>
				<CallHead tool={tool} />
				<Box
					component="span"
					sx={{
						minWidth: 0,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						fontFamily: description ? undefined : "fontFamilyMono",
					}}
				>
					{label}
				</Box>
			</ButtonBase>
			{revealed && <RevealedTarget target={target} />}
		</Box>
	);
}
