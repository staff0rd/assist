import { Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const sx = { fontSize: "0.875rem" } as const;

export function JiraKeyLink({ jiraKey }: { jiraKey?: string }) {
	const [site, setSite] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/jira-site");
				const body = await res.json();
				if (!cancelled) setSite(body?.site ?? null);
			} catch {
				if (!cancelled) setSite(null);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (!jiraKey) return null;

	if (!site) {
		return (
			<Typography variant="body2" color="text.disabled" sx={sx}>
				{jiraKey}
			</Typography>
		);
	}

	return (
		<Link
			href={`https://${site}/browse/${jiraKey}`}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
			sx={sx}
		>
			{jiraKey}
		</Link>
	);
}
