import { Listener } from 'discord-akairo';
import { Constants, Guild } from 'discord.js';

export default class GuildCreateListener extends Listener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: Constants.Events.GUILD_CREATE,
			category: 'client',
		});
	}

	public exec(guild: Guild): void {
		this.client.logger.info(`[NEW GUILD] Joined a new server! ${guild.name} | ${guild.memberCount} Member(s)`);
		void this.client.settings.guild(guild.id);
	}
}
