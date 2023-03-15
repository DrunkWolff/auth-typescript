import { Field, ObjectType } from 'type-graphql'
import { User } from '../entities/User.entity'

import { IResolverResponse } from './IResolverResponse'

@ObjectType({ implements: IResolverResponse })
export class IUserResponse implements IResolverResponse {
  code: number
  success: boolean
  message?: string

  @Field({ nullable: true })
  user?: User

  @Field({ nullable: true })
  access_token?: string

  @Field({ nullable: true })
  refresh_token?: string
}
