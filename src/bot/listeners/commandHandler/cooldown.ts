import { Constants, Listener } from 'discord-akairo';
import type { Message } from 'discord.js';

export default class CooldownListener extends Listener {
	public constructor() {
		super('cooldown', {
			category: 'commandHandler',
			emitter: 'commandHandler',
			event: Constants.CommandHandlerEvents.COOLDOWN,
		});
	}

	public exec(msg: Message, _: any, time: number): Promise<Message | Message[]> {
		time /= 1000;
		return msg.util!.reply(`Chill out! You can use that command again in ${time.toFixed()} seconds.`);
	}
}
