export type NextChip = {
	label: string;
	color: "primary" | "secondary" | "success" | "info";
};

export const nextChips = {
	review: { label: "Review", color: "primary" },
	mine: { label: "Yours", color: "info" },
	assigned: { label: "Assigned", color: "secondary" },
	pickup: { label: "Pick up", color: "success" },
} satisfies Record<string, NextChip>;
