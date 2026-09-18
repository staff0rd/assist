export const reviewButtonModes: { label: string; args: string[] }[] = [
	{ label: "Review", args: ["review"] },
	{ label: "Review & refine", args: ["review", "--refine"] },
	{ label: "Review & apply", args: ["review", "--apply"] },
	{ label: "Review & post", args: ["review", "--no-prompt", "--submit"] },
	{ label: "High-level review", args: ["review", "--high-level"] },
];
