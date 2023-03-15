import { Request, Response } from 'express'
import { ContextJwtPayload } from './contextJwtPayload'
export interface Context {
  req: Request
  res: Response
  user: ContextJwtPayload
}
