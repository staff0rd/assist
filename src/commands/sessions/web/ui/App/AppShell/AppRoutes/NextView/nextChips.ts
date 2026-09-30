export type NextChip = {
	label: string;
	color: "primary" | "secondary" | "success";
};

export const nextChips = {
	review: { label: "Review", color: "primary" },
	assigned: { label: "Assigned", color: "secondary" },
	pickup: { label: "Pick up", color: "success" },
} satisfies Record<string, NextChip>;
