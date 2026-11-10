import { Box, Checkbox, Radio, Typography } from "@mui/material";
import type { QuestionOptionRowProps } from "./QuestionOptionRowProps";
import { OptionPreviewButton } from "./OptionPreviewButton";
import { questionOptionRowSx } from "./questionOptionRowSx";

export function QuestionOptionRow({
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
		<Box
			component="label"
			sx={questionOptionRowSx(checked)}
			onMouseEnter={onPeek}
			onFocus={onPeek}
		>
			<Control
				name={name}
				size="small"
				checked={checked}
				onChange={onChange}
				sx={{ p: 0, mt: 0.25 }}
			/>
			<Box
				sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
			>
				<Typography variant="body2" sx={{ fontWeight: 600 }}>
					{label}
				</Typography>
				{description && (
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						{description}
					</Typography>
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
