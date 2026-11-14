import Box from "@mui/material/Box";

export const SDK_TAIL_SEPARATOR = " · ";

export function SdkTailDetail({ text, rate }: { text: string; rate?: string }) {
	return (
		<>
			{SDK_TAIL_SEPARATOR}
			<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				{text}
			</Box>
			{rate && `${SDK_TAIL_SEPARATOR}${rate}`}
		</>
	);
}
