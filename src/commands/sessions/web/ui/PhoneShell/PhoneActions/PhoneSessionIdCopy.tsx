import ButtonBase from "@mui/material/ButtonBase";
import { useCopyFeedback } from "../../App/useCopyFeedback";

const buttonSx = {
	font: "inherit",
	color: "inherit",
	verticalAlign: "baseline",
	borderRadius: 0.5,
} as const;

export function PhoneSessionIdCopy({ id }: { id: string }) {
	const { copied, copy } = useCopyFeedback(id);
	return (
		<ButtonBase
			sx={buttonSx}
			onClick={(e) => {
				e.stopPropagation();
				copy();
			}}
			aria-label={copied ? "Copied session id" : `Copy session id ${id}`}
		>
			{copied ? "Copied" : `#${id}`}
		</ButtonBase>
	);
}
