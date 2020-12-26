import { Argument } from 'discord-akairo';
import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class PlayCommand extends MoosikCommand {
	public constructor() {
		super('volume', {
			category: 'music',
			channel: 'guild',
			aliases: ['volume', 'vol'],
			description: {
				content: 'Sets or displays the volume',
				usage: '[volume]',
				examples: ['', '50'],
			},
			args: [
				{
					id: 'volume',
					type: Argument.validate('integer', (_, str): boolean => {
						const int = parseInt(str, 10);
						if (isNaN(int) || int > 100 || int < 1) return false;
						return true;
					}),
					prompt: {
						start: 'what would you like to set the volume to (1-100)?',
						retry:
							'what would you like to set the volume to? Please provide an integer less than 100 and greater than one.',
						optional: true,
					},
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{
			volume,
		}: {
			volume: number | null;
		},
	): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('You must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('No music is playing!');

		if (volume === null) return msg.util?.reply(`The volume is at \`${player.volume}%\`.`);

		if (player.voiceChannel !== msg.member.voice.channelID)
			return msg.util?.reply("What makes you think I'll let you rain on their parade?!");

		if (volume === player.volume) return msg.util?.reply(`The volume is already at \`${volume}%\`!`);
		const oldVolume = player.volume;

		player.setVolume(volume);

		return msg.util?.reply(`Changed the volume from \`${oldVolume}%\` to \`${volume}%\`!`);
	}
}
