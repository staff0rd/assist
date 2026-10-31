import Box from "@mui/material/Box";

const messageSx = { px: 2.5, pt: 1.5, fontSize: 15 } as const;

export function PhoneUpdateMessages({
	back,
	error,
}: {
	back: string | null;
	error: string | null;
}) {
	return (
		<>
			{back && (
				<Box sx={[messageSx, { color: "success.main" }]} role="status">
					{back}
				</Box>
			)}
			{error && (
				<Box sx={[messageSx, { color: "error.main" }]} role="alert">
					{error}
				</Box>
			)}
		</>
	);
}
