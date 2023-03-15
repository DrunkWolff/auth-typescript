import { JwtPayload } from 'jsonwebtoken'

export type ContextJwtPayload = JwtPayload & { userId: number }
