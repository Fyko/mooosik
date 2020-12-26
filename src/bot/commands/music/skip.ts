import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class SkipCommand extends MoosikCommand {
	public constructor() {
		super('skip', {
			category: 'music',
			channel: 'guild',
			aliases: ['skip'],
			description: {
				content: 'Skips the current song.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('no music is playing!');

		if (player.voiceChannel !== msg.member.voice.channelID)
			return msg.util?.reply("what makes you think I'll let you rain on their parade?");

		const { current } = player.queue;
		player.stop();

		return msg.util?.reply(`Skipped **${current?.title}**. Now playing **${player.queue.current?.title}**`);
	}
}
