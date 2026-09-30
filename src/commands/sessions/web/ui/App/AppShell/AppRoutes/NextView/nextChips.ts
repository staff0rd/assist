export type NextChip = {
	label: string;
	color: "primary" | "secondary";
};

export const nextChips = {
	review: { label: "Review", color: "primary" },
	assigned: { label: "Assigned", color: "secondary" },
} satisfies Record<string, NextChip>;
