export type ActionButtonTone =
	| "muted"
	| "start"
	| "stop"
	| "starred"
	| "inherit";

const tones: Record<
	ActionButtonTone,
	{ color: string; labelled?: string; hover?: string }
> = {
	muted: {
		color: "text.disabled",
		labelled: "text.secondary",
		hover: "text.primary",
	},
	start: {
		color: "text.disabled",
		labelled: "text.secondary",
		hover: "success.main",
	},
	stop: { color: "success.main", hover: "error.main" },
	starred: { color: "warning.main", hover: "warning.main" },
	inherit: { color: "inherit" },
};

type ToneSx = { color: string; "&:hover"?: { color: string } };

export function actionButtonSx(
	tone: ActionButtonTone,
	labelled: boolean,
): ToneSx {
	const { color, labelled: labelledColor, hover } = tones[tone];
	const resolved = labelled && labelledColor ? labelledColor : color;
	return hover
		? { color: resolved, "&:hover": { color: hover } }
		: { color: resolved };
}
