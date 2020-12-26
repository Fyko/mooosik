import { Listener } from 'discord-akairo';
import { Constants } from 'discord.js';

export default class DebugListener extends Listener {
	public constructor() {
		super('debug', {
			category: 'client',
			emitter: 'client',
			event: Constants.Events.DEBUG,
		});
	}

	public exec(event: string): void {
		this.client.logger.debug(`[DEBUG]: ${event}`);
	}
}
