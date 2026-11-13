import { toDatabaseConnectionError } from "../../shared/db/DatabaseConnectionError";
import { createPool } from "../../shared/db/createPool";
import { pgExecutor } from "../../shared/db/migrations/MigrationExecutor";

export async function withPool(
	fn: (exec: ReturnType<typeof pgExecutor>) => Promise<void>,
): Promise<void> {
	const pool = createPool();
	try {
		await fn(pgExecutor(pool));
	} catch (error) {
		throw toDatabaseConnectionError(error);
	} finally {
		await pool.end();
	}
}
