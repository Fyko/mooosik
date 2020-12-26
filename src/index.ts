import Client from './bot';

const client = new Client({
	token: process.env.TOKEN!,
	owners: process.env.OWNERS!.split(','),
	color: process.env.COLOR!,
	prefix: process.env.PREFIX!,
});

void client.launch();

process.on('SIGTERM', () => {
	for (const player of client.music.players.values()) player.destroy();
	for (const node of client.music.nodes.values()) node.destroy();

	client.destroy();

	return true;
});
