import type { Browser, BrowserContext } from "playwright";
import { importLoginScript } from "./importLoginScript";
import type { InstanceAuth } from "./InstanceAuth";
import type { LoginScript } from "./LoginScript";

export type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

export async function signIn(
	browser: Pick<Browser, "newContext">,
	auth: InstanceAuth | undefined,
	url: string,
	load: (path: string) => Promise<LoginScript> = importLoginScript,
): Promise<StorageState | undefined> {
	if (!auth) return undefined;
	console.log(`Signing in with ${auth.script}`);
	const context = await browser.newContext();
	try {
		const login = await load(auth.script);
		const page = await context.newPage();
		await login({ page, url, credentials: auth.credentials });
		return await context.storageState();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Sign-in with ${auth.script} failed: ${message}`);
	} finally {
		await context.close();
	}
}
