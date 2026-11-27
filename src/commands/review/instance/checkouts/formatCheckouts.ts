import type { InstanceCheckout } from "./InstanceCheckout";

export function formatCheckouts(checkouts: InstanceCheckout[]): string {
	return checkouts
		.map(
			(checkout) =>
				`  ${checkout.services.join(", ") || "(no services)"}: ${checkout.repo}@${checkout.sha.slice(0, 7)} (${checkout.source})`,
		)
		.join("\n");
}
