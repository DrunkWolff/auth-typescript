import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class IRefreshToken {
  @Field()
  access_token: string

  @Field()
  refresh_token: string
}
