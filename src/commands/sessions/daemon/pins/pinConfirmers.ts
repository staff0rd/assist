import { approveDocsUnlock } from "../../../docs/approveDocsUnlock";
import type { PinConfirmResult } from "../../../notify/PinConfirmResult";

type Confirmer = (pin: string) => Promise<PinConfirmResult | undefined>;

export const pinConfirmers: Record<string, Confirmer> = {
	docs: approveDocsUnlock,
};
