import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class ResumeCommand extends MoosikCommand {
	public constructor() {
		super('resume', {
			category: 'music',
			channel: 'guild',
			aliases: ['resume'],
			description: {
				content: 'Resumes the music.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('no music is playing!');

		if (player.voiceChannel !== msg.member.voice.channelID)
			return msg.util?.reply("what makes you think I'll let you rain on their parade?");

		if (!player.paused) return msg.util?.reply('the music is already playing!');

		player.pause(false);

		return msg.util?.reply('resumed the music.');
	}
}
