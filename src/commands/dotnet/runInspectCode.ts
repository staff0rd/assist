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

export function runInspectCode(
	slnPath: string,
	include: string | null,
	swea: boolean,
): string {
	const reportPath = path.join(tmpdir(), `inspect-${Date.now()}.xml`);
	const includeFlag = include ? ` --include="${include}"` : "";
	const sweaFlag = swea ? " --swea" : "";
	try {
		execSync(
			`jb inspectcode "${slnPath}" -o="${reportPath}"${includeFlag}${sweaFlag} --verbosity=OFF`,
			{ stdio: "pipe" },
		);
	} catch (error) {
		if (error && typeof error === "object" && "stderr" in error) {
			process.stderr.write(error.stderr as Buffer);
		}
		console.error(chalk.red("jb inspectcode failed"));
		process.exit(1);
	}

	if (!existsSync(reportPath)) {
		console.error(chalk.red("Report file not generated"));
		process.exit(1);
	}

	const xml = readFileSync(reportPath, "utf8");
	unlinkSync(reportPath);
	return xml;
}
