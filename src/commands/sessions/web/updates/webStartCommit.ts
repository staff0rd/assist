import { getInstallDir } from "../../../../shared/getInstallDir";
import { headCommit } from "../../../watch/headCommit";

let captured: string | undefined;

export const webStartCommit = {
	capture: (): void => {
		captured = headCommit(getInstallDir());
	},
	value: (): string | undefined => captured,
};
