import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class PlayCommand extends MoosikCommand {
	public constructor() {
		super('play', {
			category: 'music',
			channel: 'guild',
			aliases: ['play'],
			description: {
				content: 'Plays a song in your current voice channel.',
			},
			args: [
				{
					id: 'query',
					match: 'rest',
					prompt: {
						start: 'what song would you like to play?',
						retry: 'what song would you like to play?',
					},
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{
			query,
		}: {
			query: string;
		},
	): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		if (!msg.member.voice.channel.joinable)
			return msg.util?.reply("I don't have permissions to join your voice channel.");
		if (!msg.member.voice.channel.speakable)
			return msg.util?.reply("I don't have permissions to speak in your voice channel.");

		const res = await this.client.music.search(query);
		const player =
			this.client.music.get(msg.member.voice.channelID!) ??
			this.client.music.create({
				guild: msg.guild!.id,
				voiceChannel: msg.member.voice.channelID!,
				textChannel: msg.channel.id,
			});

		if (player.state !== 'CONNECTED') player.connect();

		let status = '';
		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			player.queue.add(res.tracks[0]);
			status = res.tracks[0].title;
		} else if (res.loadType === 'PLAYLIST_LOADED') {
			player.queue.add(res.tracks);
			status = `${res.playlist!.name} (${res.tracks.length} tracks)`;
		} else {
			return msg.util?.reply("hate to break it to you, but I couldn't find that literally anywhere.");
		}

		if (!player.playing && !player.paused) await player.play();

		return msg.util?.send(`**Queued up**: ${status}`);
	}
}
