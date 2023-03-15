import { Secret, sign } from 'jsonwebtoken'
import { User } from '../entities/User.entity'

export const createToken = (user: User) =>
  sign(
    { userId: user.id, status: user.status, isAdmin: user.isAdmin },
    process.env.JWT_KEY as Secret,
    { expiresIn: '15m' },
  )
export const refreshToken = (user: User) =>
  sign(
    { userId: user.id, status: user.status, isAdmin: user.isAdmin },
    process.env.JWT_KEY_REFRESH as Secret,
  )
