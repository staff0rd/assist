import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { NewsItem } from "./NewsView/NewsItem";
import { type DateGroup, groupByDate } from "./NewsView/groupByDate";
import type { FeedItem } from "./NewsView/types";
import { PageShell } from "./PageShell";

async function fetchNewsItems(): Promise<FeedItem[]> {
	const res = await fetch("/api/news/items");
	return res.json();
}

export function NewsView() {
	const [groups, setGroups] = useState<DateGroup[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchNewsItems()
			.then((items) => setGroups(groupByDate(items)))
			.finally(() => setLoading(false));
	}, []);

	return (
		<PageShell
			loading={loading}
			isEmpty={groups.length === 0}
			emptyMessage="No news items."
		>
			{groups.map((group) => (
				<Box key={group.label} sx={{ mb: 4 }}>
					<Typography
						variant="overline"
						color="text.secondary"
						sx={{ display: "block", mb: 1, px: 0.5 }}
					>
						{group.label}
					</Typography>
					<Stack spacing={1}>
						{group.items.map((item) => (
							<NewsItem key={`${item.link}-${item.pubDate}`} item={item} />
						))}
					</Stack>
				</Box>
			))}
		</PageShell>
	);
}
