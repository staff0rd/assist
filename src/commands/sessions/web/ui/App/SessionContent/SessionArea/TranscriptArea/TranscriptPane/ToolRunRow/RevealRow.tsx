import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { type ReactNode, useState } from "react";
import type { ToolInputField } from "../../../../../../../../../../shared/harnessAdapters/types";
import { CallHead } from "./CallHead";
import { callRowSx } from "./callRowSx";
import { RevealedFields } from "./RevealedFields";
import { RevealedTarget } from "./RevealedTarget";

export function RevealRow({
	tool,
	target,
	description,
	label,
	fields,
}: {
	tool: string;
	target: string;
	description?: string;
	label: ReactNode;
	fields?: ToolInputField[];
}) {
	const [revealed, setRevealed] = useState(false);
	return (
		<Box>
			<ButtonBase
				data-preview-skip
				aria-expanded={revealed}
				disabled={!target && !fields?.length}
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
			{revealed &&
				(fields?.length ? (
					<RevealedFields fields={fields} />
				) : (
					<RevealedTarget target={target} />
				))}
		</Box>
	);
}
