import Typography from "@mui/material/Typography";

const setter = "assist config set next.peers alice,bob -g --repo";

export function NextPeersNote({ peers }: { peers: string[] }) {
	if (peers.length > 0)
		return (
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				Peer PRs from {peers.join(", ")}, plus any PR requesting your review.
			</Typography>
		);
	return (
		<Typography variant="body2" sx={{ color: "text.secondary" }}>
			No peers configured — only PRs requesting your review appear. Add peers
			with{" "}
			<Typography
				component="code"
				variant="body2"
				sx={{ fontFamily: "monospace" }}
			>
				{setter}
			</Typography>
		</Typography>
	);
}
