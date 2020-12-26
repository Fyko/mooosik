import { Listener } from 'discord-akairo';
import { Constants, DiscordAPIError } from 'discord.js';

export default class ErrorListener extends Listener {
	public constructor() {
		super('err', {
			category: 'client',
			emitter: 'client',
			event: Constants.Events.ERROR,
		});
	}

	public exec(err: DiscordAPIError): void {
		this.client.logger.error(`[CLIENT ERROR]: ${err}`);
	}
}
