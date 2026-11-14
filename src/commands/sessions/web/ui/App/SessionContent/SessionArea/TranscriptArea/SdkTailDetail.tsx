import Box from "@mui/material/Box";

export const SDK_TAIL_SEPARATOR = " · ";

export function SdkTailDetail({
	text,
	rate,
	idle,
}: {
	text: string;
	rate?: string;
	idle?: string;
}) {
	return (
		<>
			{SDK_TAIL_SEPARATOR}
			<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				{text}
			</Box>
			{rate && `${SDK_TAIL_SEPARATOR}${rate}`}
			{idle && (
				<>
					{SDK_TAIL_SEPARATOR}
					<Box component="span" sx={{ color: "warning.main" }}>
						{idle}
					</Box>
				</>
			)}
		</>
	);
}
