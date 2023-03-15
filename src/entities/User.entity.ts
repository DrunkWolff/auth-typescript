import { Field, ID, ObjectType } from 'type-graphql'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
@ObjectType()
export class User {
  @Field(_type => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Field()
  @Column({ unique: true })
  username: string

  @Field()
  @Column()
  password: string

  @Field()
  @Column({ default: false })
  status: boolean

  @Field()
  @Column({ default: false })
  isAdmin: boolean

  @Field()
  @Column({ nullable: true, default: 'access_token' })
  access_token: string

  @Field()
  @Column({ nullable: true, default: 'refresh_token' })
  refresh_token: string

  @Field()
  @CreateDateColumn()
  createAt: Date

  @Field()
  @UpdateDateColumn()
  updateAt: Date
}
