import { Listener } from 'discord-akairo';
import { Constants } from 'discord.js';

export default class ShardDisconnectedListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			category: 'shard',
			emitter: 'shard',
			event: Constants.Events.SHARD_DISCONNECT,
		});
	}

	public exec(data: any, shardID: number): void {
		this.client.logger.warn(`[SHARD ${shardID} DISCONNECTED]: Shard ${shardID} just DC'd with code ${data.code}`);
	}
}
