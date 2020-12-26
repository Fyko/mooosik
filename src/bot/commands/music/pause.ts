import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class PauseCommand extends MoosikCommand {
	public constructor() {
		super('pause', {
			category: 'music',
			channel: 'guild',
			aliases: ['pause', 'stop', 'cease'],
			description: {
				content: 'Pauses the music.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('no music is playing!');

		if (player.voiceChannel !== msg.member.voice.channelID)
			return msg.util?.reply("what makes you think I'll let you rain on their parade?");

		if (player.paused) return msg.util?.reply('the music is already paused!');

		player.pause(true);

		return msg.util?.reply('paused the music.');
	}
}
