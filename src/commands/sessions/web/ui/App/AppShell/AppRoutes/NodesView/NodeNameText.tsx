import Typography from "@mui/material/Typography";

export function NodeNameText({ name }: { name: string }) {
	return (
		<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
			{name}
		</Typography>
	);
}
