import Typography from "@mui/material/Typography";

export function PhoneQueuedCommentCount({ count }: { count: number }) {
	if (count === 0) return null;
	return (
		<Typography variant="caption" color="text.secondary">
			{count === 1
				? "1 comment goes with your approval"
				: `${count} comments go with your approval`}
		</Typography>
	);
}
