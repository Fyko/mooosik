import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';

@Entity('guilds')
export class Guild extends BaseEntity {
	@PrimaryColumn('bigint')
	public id!: string;

	@Column('text', { default: process.env.PREFIX })
	public prefix!: string;
}
