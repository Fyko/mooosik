import 'reflect-metadata';

import { createConnection, Connection } from 'typeorm';
import type { Logger } from 'winston';
import { Guild } from '..';
import type MoosikClient from '../../bot/client/MoosikClient';

/**
 * The Settings Provider that handles all database reads and rights.
 * @private
 */
export default class SettingsProvider {
	public readonly models = {
		guild: Guild,
	};

	public connection!: Connection;

	// eslint-disable-next-line no-useless-constructor
	public constructor(protected readonly client: MoosikClient) {}

	/**
	 * Connect to the database
	 * @param {string} url - the mongodb uri
	 * @returns {Promise<number | Logger>} Returns a
	 */
	private async _connect(): Promise<Logger | number> {
		const start = Date.now();
		try {
			this.connection = await createConnection();
			// this.connection.synchronize(true);
		} catch (err) {
			this.client.logger.error(`[DATABASE] Error when connecting to Postgres:\n${err.stack}`);
			process.exit(1);
		}
		return this.client.logger.verbose(`[DATABASE] Connected to Postgres in ${Date.now() - start}ms.`);
	}

	public async guild(id: string): Promise<Guild> {
		const row = await Guild.findOne({ id });
		if (row) return row;
		return Guild.create({ id }).save();
	}

	/**
	 * Starts the Settings Provider
	 * @returns {SettingsProvider}
	 */
	public async init(): Promise<this> {
		await this._connect();

		return this;
	}
}
