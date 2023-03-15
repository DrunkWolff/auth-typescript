import { Context } from '../types/context'
import { MiddlewareFn } from 'type-graphql'
import { GraphQLError } from 'graphql'
import { Secret, verify } from 'jsonwebtoken'
import { ContextJwtPayload } from '../types/contextJwtPayload'
import { AppDataSource } from '../DataSource'
import { User } from '../entities/User.entity'

export const checkAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  const authHeader = context.req.header('Authorization')
  const accessToken = authHeader && authHeader.split(' ')[1]
  if (!accessToken) {
    throw new GraphQLError('You are not authorized perform this actions.', {
      extensions: {
        code: 'BAD_REQUEST',
      },
    })
  }
  const user = await AppDataSource.getRepository(User).find({
    where: { access_token: accessToken },
  })
  if (!user[0]) {
    throw new GraphQLError('You are not authorized', {
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
    })
  }
  try {
    const verifyToken = verify(accessToken, process.env.JWT_KEY as Secret) as ContextJwtPayload
    context.user = verifyToken
    return next()
  } catch (error) {
    throw new GraphQLError('Access token had been expired.', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    })
  }
}
