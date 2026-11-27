import type { Page } from "playwright";
import type { LoginCredentials } from "./InstanceAuth";

export type LoginScript = (input: {
	page: Page;
	url: string;
	credentials: LoginCredentials;
}) => Promise<void> | void;
