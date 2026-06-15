import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { timeAgo } from "./news/timeAgo";
import type { FeedItem } from "./news/types";

const cardSx = {
	display: "block",
	bgcolor: "background.paper",
	borderRadius: 2,
	p: 2.5,
	transition: "background-color 0.15s",
	"&:hover": { bgcolor: "action.hover" },
} as const;

const faviconSx = { width: 16, height: 16 } as const;

export function NewsItem({ item }: { item: FeedItem }) {
	return (
		<Link
			href={item.link}
			target="_blank"
			rel="noopener noreferrer"
			underline="none"
			color="inherit"
			sx={cardSx}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
				<Avatar
					src={`${item.feedOrigin}/favicon.ico`}
					variant="rounded"
					sx={faviconSx}
				>
					{" "}
				</Avatar>
				<Chip label={item.feedTitle} size="small" />
				<Typography variant="body2" color="text.secondary">
					{timeAgo(item.pubDate)}
				</Typography>
			</Box>
			<Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
				{item.title}
			</Typography>
			{item.excerpt && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
					{item.excerpt}
				</Typography>
			)}
		</Link>
	);
}
