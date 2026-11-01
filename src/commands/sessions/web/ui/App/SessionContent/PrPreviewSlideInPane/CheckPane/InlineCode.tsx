import Box from "@mui/material/Box";

const codeSx = {
	fontFamily: "fontFamilyMono",
	fontSize: "0.88em",
	bgcolor: "action.hover",
	px: 0.5,
	borderRadius: 0.5,
} as const;

export function InlineCode({ text }: { text: string }) {
	return (
		<>
			{text.split("`").map((part, i) =>
				i % 2 === 1 ? (
					<Box component="code" key={i} sx={codeSx}>
						{part}
					</Box>
				) : (
					part
				),
			)}
		</>
	);
}
