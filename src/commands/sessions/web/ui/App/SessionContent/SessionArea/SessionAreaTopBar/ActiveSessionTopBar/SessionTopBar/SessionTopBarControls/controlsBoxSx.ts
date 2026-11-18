const controlsSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 1,
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	minWidth: 0,
} as const;

const leadingSx = { justifyContent: "flex-start", flexGrow: 1 } as const;

export function controlsBoxSx(leading: boolean, width: number | undefined) {
	return { ...controlsSx, ...(leading && leadingSx), width };
}
