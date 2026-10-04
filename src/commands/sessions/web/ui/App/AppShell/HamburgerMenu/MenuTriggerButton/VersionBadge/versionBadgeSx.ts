export const versionBadgeSx = (ready: boolean) =>
	({
		display: "inline-flex",
		alignItems: "center",
		gap: 0.75,
		px: 1,
		py: 0.25,
		borderRadius: 999,
		fontSize: 12,
		lineHeight: 1.5,
		color: "inherit",
		opacity: ready ? 1 : 0.55,
		bgcolor: ready ? "rgba(255,255,255,0.16)" : "transparent",
		transition: "opacity .2s ease, background-color .2s ease",
		"&:hover, &:focus-visible": {
			opacity: 1,
			bgcolor: "rgba(255,255,255,0.12)",
		},
		"& .ready-dot": {
			width: 8,
			height: 8,
			borderRadius: "50%",
			bgcolor: "#ffb74d",
			boxShadow: "0 0 0 2px rgba(0,0,0,.15)",
		},
		"& .ready-count": { fontWeight: 500 },
	}) as const;
