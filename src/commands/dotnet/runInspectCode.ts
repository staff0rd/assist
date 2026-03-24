import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import chalk from "chalk";

export function assertJbInstalled(): void {
	try {
		execSync("jb inspectcode --version", { stdio: "pipe" });
	} catch {
		console.error(chalk.red("jb is not installed. Install with:"));
		console.error(
			chalk.yellow("  dotnet tool install -g JetBrains.ReSharper.GlobalTools"),
		);
		process.exit(1);
	}
}

export function runInspectCode(slnPath: string, include: string): string {
	const reportPath = path.join(tmpdir(), `inspect-${Date.now()}.xml`);
	try {
		execSync(
			`jb inspectcode "${slnPath}" -o="${reportPath}" --include="${include}" --swea --verbosity=OFF`,
			{ stdio: "pipe" },
		);
	} catch (err) {
		if (err && typeof err === "object" && "stderr" in err) {
			process.stderr.write(err.stderr as Buffer);
		}
		console.error(chalk.red("jb inspectcode failed"));
		process.exit(1);
	}

	if (!existsSync(reportPath)) {
		console.error(chalk.red("Report file not generated"));
		process.exit(1);
	}

	const xml = readFileSync(reportPath, "utf-8");
	unlinkSync(reportPath);
	return xml;
}
