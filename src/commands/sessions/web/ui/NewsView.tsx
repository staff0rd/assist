import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { NewsItem } from "./NewsItem";
import { type DateGroup, groupByDate } from "./news/groupByDate";
import type { FeedItem } from "./news/types";

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

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (groups.length === 0) {
		return (
			<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No news items.
				</Typography>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
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
		</Container>
	);
}
