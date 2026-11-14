import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import { callLabel } from "./callLabel";
import { callRowSx } from "./callRowSx";
import { RevealedTarget } from "./RevealedTarget";

export function ToolCallRow({
	tool,
	target,
	description,
}: {
	tool: string;
	target: string;
	description?: string;
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
				<BuildIcon
					sx={{ fontSize: 14, color: "text.disabled", flex: "none" }}
				/>
				<Box
					component="span"
					sx={{ color: "warning.main", fontFamily: "fontFamilyMono" }}
				>
					{tool}
				</Box>
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
					{callLabel({ tool, target, description })}
				</Box>
			</ButtonBase>
			{revealed && <RevealedTarget target={target} />}
		</Box>
	);
}
