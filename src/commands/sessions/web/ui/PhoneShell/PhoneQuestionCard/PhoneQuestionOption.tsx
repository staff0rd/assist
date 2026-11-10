import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import type { QuestionOptionRowProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionOptionRowProps";
import { OptionPreviewButton } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/OptionPreviewButton";
import { optionSx } from "./optionSx";

export function PhoneQuestionOption({
	name,
	multiSelect,
	checked,
	label,
	description,
	onChange,
	onPeek,
	previewShown = false,
	children,
}: QuestionOptionRowProps) {
	const Control = multiSelect ? Checkbox : Radio;
	return (
		<Box component="label" sx={optionSx(checked)}>
			<Control
				name={name}
				checked={checked}
				onChange={onChange}
				sx={{ p: 0 }}
			/>
			<Box sx={{ minWidth: 0 }}>
				<Box sx={{ fontSize: 16, fontWeight: 600 }}>{label}</Box>
				{description && (
					<Box sx={{ fontSize: 13, lineHeight: 1.35, color: "text.secondary" }}>
						{description}
					</Box>
				)}
				{children}
			</Box>
			{onPeek && (
				<OptionPreviewButton
					label={label}
					shown={previewShown}
					onPeek={onPeek}
				/>
			)}
		</Box>
	);
}
