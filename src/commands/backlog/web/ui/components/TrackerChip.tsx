import Chip from "@mui/material/Chip";

const chipSx = { height: 18, fontSize: "0.65rem" } as const;

type TrackerChipProps = { label: string; url?: string; title?: string };

export function TrackerChip({ label, url, title }: TrackerChipProps) {
	if (!url)
		return (
			<Chip
				label={label}
				title={title}
				size="small"
				sx={chipSx}
				clickable={false}
				onClick={(e) => e.stopPropagation()}
			/>
		);

	return (
		<Chip
			label={label}
			title={title}
			size="small"
			sx={chipSx}
			clickable
			component="a"
			href={url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
		/>
	);
}
