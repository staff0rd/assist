import chalk from "chalk";
import { isMutation } from "./isMutation";
import { resolveConnection } from "./resolveConnection";
import { sqlConnect } from "./sqlConnect";

export async function sqlMutate(
	query: string,
	connectionName?: string,
): Promise<void> {
	if (!isMutation(query)) {
		console.error(
			chalk.red(
				"assist sql mutate refuses non-mutating statements. Use `assist sql query` instead.",
			),
		);
		process.exit(1);
	}
	const conn = resolveConnection(connectionName);
	const pool = await sqlConnect(conn);
	try {
		const result = await pool.request().query(query);
		console.log(chalk.dim(`${result.rowsAffected.join(", ")} row(s) affected`));
	} finally {
		await pool.close();
	}
}
