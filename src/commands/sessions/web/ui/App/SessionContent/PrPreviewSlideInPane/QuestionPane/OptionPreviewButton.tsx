import Button from "@mui/material/Button";
import type { MouseEvent } from "react";

export function OptionPreviewButton({
	label,
	shown,
	onPeek,
}: {
	label: string;
	shown: boolean;
	onPeek: () => void;
}) {
	const peekWithoutPicking = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		onPeek();
	};
	return (
		<Button
			size="small"
			variant={shown ? "contained" : "outlined"}
			disableElevation
			aria-label={`Preview ${label}`}
			aria-pressed={shown}
			onClick={peekWithoutPicking}
			sx={{ flexShrink: 0, alignSelf: "flex-start" }}
		>
			Preview
		</Button>
	);
}
