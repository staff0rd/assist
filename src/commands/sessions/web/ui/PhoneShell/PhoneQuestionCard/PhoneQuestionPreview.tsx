import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";

const frameSx = {
	border: 1,
	borderColor: "divider",
	borderRadius: "12px",
	overflow: "hidden",
	bgcolor: (t: Theme) => t.tokens.terminal.background,
} as const;

const headSx = {
	display: "flex",
	gap: 1,
	px: 1.5,
	py: 0.75,
	borderBottom: 1,
	borderColor: "divider",
	fontSize: 12,
} as const;

const bodySx = {
	m: 0,
	px: 1.5,
	py: 1.25,
	fontFamily: "fontFamilyMono",
	fontSize: 12,
	whiteSpace: "pre",
	overflowX: "auto",
	WebkitOverflowScrolling: "touch",
} as const;

export function PhoneQuestionPreview({
	label,
	preview,
}: {
	label: string;
	preview: string;
}) {
	return (
		<Box sx={frameSx} data-testid="phone-question-preview">
			<Box sx={headSx}>
				<Box
					component="span"
					sx={{
						fontFamily: "fontFamilyMono",
						textTransform: "uppercase",
						color: "text.secondary",
					}}
				>
					Preview
				</Box>
				<Box component="span" sx={{ fontWeight: 600 }}>
					{label}
				</Box>
			</Box>
			<Box component="pre" sx={bodySx}>
				{preview}
			</Box>
		</Box>
	);
}
