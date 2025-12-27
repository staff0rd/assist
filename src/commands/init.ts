import { init as verifyInit } from "./verify/init";
import { init as vscodeInit } from "./vscode/init";

export async function init(): Promise<void> {
	await vscodeInit();
	await verifyInit();
}
