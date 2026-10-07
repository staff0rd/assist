import { execFileSync } from "node:child_process";
import { cognitiveServicesScope } from "./cognitiveServicesScope";

export function readAzCliToken(tenantId: string): string {
	try {
		return execFileSync(
			"az",
			[
				"account",
				"get-access-token",
				"--resource",
				cognitiveServicesScope,
				"--tenant",
				tenantId,
				"--query",
				"accessToken",
				"-o",
				"tsv",
			],
			{
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
				shell: process.platform === "win32",
			},
		).trim();
	} catch (error) {
		const stderr = (error as { stderr?: string }).stderr?.trim();
		throw new Error(
			`az account get-access-token failed for tenant ${tenantId}${stderr ? `: ${stderr}` : ""}; run az login --tenant ${tenantId}`,
		);
	}
}
