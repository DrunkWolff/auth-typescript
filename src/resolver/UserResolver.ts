import { User } from './../entities/User.entity'
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { AppDataSource } from './../DataSource'
import { CreateUserInput } from '../dto/CreateUserInput'
import { IUserResponse } from '../types/IUserResponse'
import CryptoJS from 'crypto-js'
import { LoginUserInput } from '../dto/LoginUserInput'
import { createToken, refreshToken } from '../utils/createToken'
import { checkAuth } from '../middleware/checkauth'
import { Context } from '../types/context'
import { IRefreshToken } from '../types/IRefreshResponse'
import { GraphQLError } from 'graphql'

@Resolver(User)
export class UserResolver {
  @Query(_return => String)
  @UseMiddleware(checkAuth)
  async hello(@Ctx() { user }: Context): Promise<string> {
    const userAccess = await AppDataSource.getRepository(User).findOne({
      where: { id: user.userId },
    })
    return `Hello ${userAccess ? userAccess.username : 'Guest'}`
  }

  @Query(_return => [User])
  @UseMiddleware(checkAuth)
  async users(): Promise<User[]> {
    return await AppDataSource.getRepository(User).find()
  }

  @Query(_return => User)
  @UseMiddleware(checkAuth)
  async user(@Arg('id', () => Int) id: number): Promise<User | null> {
    return await AppDataSource.getRepository(User).findOne({ where: { id } })
  }

  @Mutation(_return => IUserResponse)
  async register(@Arg('UserInput') UserInput: CreateUserInput): Promise<IUserResponse> {
    const { username, password } = UserInput
    const UserRepository = AppDataSource.getRepository(User)
    const user = await UserRepository.findOne({ where: { username } })
    if (user) {
      throw new GraphQLError('Validation Failed.', {
        extensions: { code: 'GRAPHQL_VALIDATION_FAILE' },
      })
    }
    const hashPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTO_KEY as string).toString()
    const newUser = UserRepository.create({ username, password: hashPassword })
    const saveUser = await UserRepository.save(newUser)
    return {
      code: 200,
      success: true,
      message: 'Register successfully',
      user: saveUser,
    }
  }

  @Mutation(_return => IUserResponse)
  async login(@Arg('UserInput') UserInput: LoginUserInput): Promise<IUserResponse> {
    const { username, password } = UserInput
    const user = await AppDataSource.getRepository(User).findOne({
      where: { username },
    })
    if (!user) {
      throw new GraphQLError('Validation Failed.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          success: false,
        },
      })
    }
    const verifyPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTO_KEY as string,
    ).toString(CryptoJS.enc.Utf8)
    if (password !== verifyPassword) {
      throw new GraphQLError('Validation Failed.', {
        extensions: { code: 'BAD_USER_INPUT', success: false },
      })
    }
    const create_token_user = createToken(user)
    const refresh_token_user = refreshToken(user)
    await AppDataSource.getRepository(User).update(user.id, {
      access_token: create_token_user,
      refresh_token: refresh_token_user,
    })
    return {
      code: 200,
      success: true,
      message: 'Login successfully.',
      user: user,
      access_token: create_token_user,
      refresh_token: refresh_token_user,
    }
  }

  @Mutation(_return => IRefreshToken)
  async refresh(@Arg('Token') token: string): Promise<IRefreshToken> {
    if (!token) {
      throw new GraphQLError('You are not authorized perform this action.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }
    const user = await AppDataSource.getRepository(User).find({
      where: { refresh_token: token },
    })
    if (!user[0]) {
      throw new GraphQLError('Refresh token is not valid.', {
        extensions: {
          code: 'GRAPHQL_VALIDATION_FAILED',
        },
      })
    }

    const access_token_user = createToken(user[0])
    const refresh_token_user = refreshToken(user[0])
    await AppDataSource.getRepository(User).update(user[0].id, {
      access_token: access_token_user,
      refresh_token: refresh_token_user,
    })
    return {
      access_token: access_token_user,
      refresh_token: refresh_token_user,
    }
  }

  @Mutation(_return => IUserResponse)
  async logout(@Arg('Token') token: string): Promise<IUserResponse> {
    if (!token) {
      throw new GraphQLError('Token is not valid.', {
        extensions: { code: 'GRAPHQL_VALIDATION_FAILE' },
      })
    }
    const user = await AppDataSource.getRepository(User).find({
      where: { refresh_token: token },
    })
    if (!user[0]) {
      throw new GraphQLError('You are not authorized perform this action.', {
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      })
    }
    await AppDataSource.getRepository(User).update(user[0].id, {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
    })
    return {
      code: 200,
      success: true,
      message: 'Logout successfully.',
    }
  }
}
