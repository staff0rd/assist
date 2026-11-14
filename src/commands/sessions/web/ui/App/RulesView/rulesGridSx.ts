import type { Theme } from "@mui/material/styles";

export function rulesGridSx(reviewing: boolean) {
	return (t: Theme) => {
		const twoColumns = `${t.spacing(35)} minmax(0, 1fr)`;
		return {
			display: "grid",
			gridTemplateColumns: {
				xs: "1fr",
				md: twoColumns,
				lg: reviewing ? `${twoColumns} ${t.spacing(45)}` : twoColumns,
			},
			gap: 2,
			alignItems: "start",
		};
	};
}
