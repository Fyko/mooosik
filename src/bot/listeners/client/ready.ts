import { Listener } from 'discord-akairo';
import { Constants } from 'discord.js';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: Constants.Events.CLIENT_READY,
			category: 'client',
		});
	}

	public exec(): void {
		this.client.logger.info(`[READY] ${this.client.user?.tag} (${this.client.user?.id}) is ready.`);
		void this.client.user?.setActivity('jams 🎶', { type: 'LISTENING' });

		for (const [id] of this.client.guilds.cache) void this.client.settings.guild(id);
	}
}
