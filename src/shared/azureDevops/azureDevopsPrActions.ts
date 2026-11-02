import { prActions } from "../prActions";

const SUPPORTED = new Set([
	"Checkout",
	"Address Comments",
	"Address Comments (auto)",
]);

export const azureDevopsPrActions = prActions.filter(({ label }) =>
	SUPPORTED.has(label),
);
