import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { touchTarget } from "../designSystem/touchTarget";

const groupSx = {
	display: "grid",
	gridAutoColumns: "1fr",
	gridAutoFlow: "column",
	mx: 2,
	p: "2px",
	borderRadius: "9px",
	bgcolor: raisedBgcolor,
	fontSize: 14,
	fontWeight: 600,
} as const;

const optionSx = {
	minHeight: touchTarget,
	py: 0.875,
	gap: 0.75,
	borderRadius: "7px",
	color: "text.secondary",
	fontSize: "inherit",
	fontWeight: "inherit",
	fontFamily: "inherit",
	"&[aria-checked='true']": {
		bgcolor: "background.paper",
		color: "text.primary",
		boxShadow: 1,
	},
} as const;

type Props = {
	label: string;
	options: readonly string[];
	value: string | undefined;
	onChange: (value: string) => void;
	optionLabel?: (value: string) => ReactNode;
	mono?: boolean;
};

export function PhoneSegmented({
	label,
	options,
	value,
	onChange,
	optionLabel = (v) => v,
	mono,
}: Props) {
	return (
		<Box
			role="radiogroup"
			aria-label={label}
			sx={[
				groupSx,
				mono ? { fontFamily: "fontFamilyMono", fontWeight: 400 } : {},
			]}
		>
			{options.map((option) => (
				<ButtonBase
					key={option}
					role="radio"
					aria-checked={option === value}
					sx={optionSx}
					onClick={() => onChange(option)}
				>
					{optionLabel(option)}
				</ButtonBase>
			))}
		</Box>
	);
}
