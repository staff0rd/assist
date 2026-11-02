export const prActions: { label: string; args: string[] }[] = [
	{ label: "Checkout", args: ["review", "--checkout-only"] },
	{ label: "Address Comments", args: ["review-pr-comments"] },
	{ label: "Address Comments (auto)", args: ["review-pr-comments", "--auto"] },
	{ label: "Fix conflicts (merge)", args: ["fix-conflict"] },
	{ label: "Fix conflicts (rebase)", args: ["fix-conflict", "--rebase"] },
];
