import { Constants, Listener } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';

export default class ErrorHandler extends Listener {
	public constructor() {
		super('error', {
			category: 'commandHandler',
			emitter: 'commandHandler',
			event: Constants.CommandHandlerEvents.ERROR,
		});
	}

	public exec(err: Error, msg: Message): void {
		this.client.logger.error(`[COMMAND ERROR] ${err} ${err.stack}`);
		if (
			msg.guild &&
			msg.channel instanceof TextChannel &&
			msg.channel.permissionsFor(this.client.user!)!.has('SEND_MESSAGES')
		) {
			void msg.channel.send(['Looks like an error occured.', '```js', `${err}`, '```']);
		}
	}
}
