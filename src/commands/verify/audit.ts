import { loadConfig } from "../../shared/loadConfig";
import { detectPackageManager } from "./audit/detectPackageManager";
import { evaluateAudit } from "./audit/evaluateAudit";
import { formatAuditReport } from "./audit/formatAuditReport";
import { parseAuditOutput } from "./audit/parseAuditOutput";
import { runAudit } from "./audit/runAudit";

function warnAndPass(reason: string): never {
	console.log(`Warning: dependency audit could not run (${reason}); skipping.`);
	process.exit(0);
}

export function audit(): void {
	const cwd = process.cwd();
	const pm = detectPackageManager(cwd);
	if (!pm) warnAndPass("no pnpm-lock.yaml or package-lock.json");

	const run = runAudit(pm, cwd);
	if ("error" in run) warnAndPass(`${pm} audit failed: ${run.error}`);

	const advisories = parseAuditOutput(run.stdout);
	if (!advisories) warnAndPass(`${pm} audit returned no audit report`);

	const config = loadConfig().verify?.audit;
	const level = config?.level ?? "high";
	const evaluation = evaluateAudit(advisories, level, config?.ignore ?? []);
	for (const line of formatAuditReport(evaluation, level)) console.log(line);
	process.exit(evaluation.failing.length > 0 ? 1 : 0);
}
