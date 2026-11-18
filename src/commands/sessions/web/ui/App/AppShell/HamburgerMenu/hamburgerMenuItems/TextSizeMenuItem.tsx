import FormatSizeIcon from "@mui/icons-material/FormatSize";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import type { KeyboardEvent } from "react";
import { useTextSizeContext } from "../../../useTextSizeContext";
import { TextSizeStepper } from "./TextSizeMenuItem/TextSizeStepper";

const stepKeys: Record<string, number> = {
	ArrowLeft: -1,
	"-": -1,
	ArrowRight: 1,
	"+": 1,
	"=": 1,
};

export function TextSizeMenuItem() {
	const { textSizeOffset, setTextSizeOffset } = useTextSizeContext();
	const onStep = (delta: number) => setTextSizeOffset(textSizeOffset + delta);
	const onKeyDown = (event: KeyboardEvent) => {
		const delta = stepKeys[event.key];
		if (delta === undefined) return;
		event.preventDefault();
		event.stopPropagation();
		onStep(delta);
	};

	return (
		<MenuItem disableRipple onKeyDown={onKeyDown} sx={{ py: 0.5 }}>
			<ListItemIcon>
				<FormatSizeIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>Text size</ListItemText>
			<TextSizeStepper offset={textSizeOffset} onStep={onStep} />
		</MenuItem>
	);
}
