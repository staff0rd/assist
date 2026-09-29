import { PGlite } from "@electric-sql/pglite";

type SharedTestPgliteHolder = Record<symbol, PGlite | undefined>;

const SHARED_TEST_PGLITE_KEY = Symbol.for("assist.sharedTestPglite");

export async function sharedTestPglite(): Promise<PGlite> {
	const holder = globalThis as SharedTestPgliteHolder;
	let lite = holder[SHARED_TEST_PGLITE_KEY];
	if (!lite) {
		lite = new PGlite();
		holder[SHARED_TEST_PGLITE_KEY] = lite;
	}
	await lite.exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
	return lite;
}
