import ButtonBase from "@mui/material/ButtonBase";
import type { MouseEvent } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { reviewAlternateSx } from "./reviewAlternateSx";

export function HarnessButton({
	label,
	harness,
	onClick,
}: {
	label: string;
	harness: HarnessKind;
	onClick: (e: MouseEvent) => void;
}) {
	return (
		<ButtonBase
			tabIndex={-1}
			aria-label={`Run ${label} on ${harnessLabel(harness)}`}
			title={`Run on ${harnessLabel(harness)}`}
			sx={reviewAlternateSx.button}
			onClick={(e) => {
				e.stopPropagation();
				onClick(e);
			}}
		>
			{harnessLabel(harness)}
		</ButtonBase>
	);
}
