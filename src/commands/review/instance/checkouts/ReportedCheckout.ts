import type { InstanceCheckout } from "./InstanceCheckout";

export type ReportedCheckout = Pick<
	InstanceCheckout,
	"services" | "repo" | "sha" | "source"
>;
