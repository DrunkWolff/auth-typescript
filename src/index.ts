import 'reflect-metadata'
import express from 'express'
import http from 'http'
import { ApolloServer } from '@apollo/server'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolver/UserResolver'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'
import { AppDataSource } from './DataSource'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const main = async () => {
  const port = parseInt(process.env.SERVER_PORT as string)
  const app = express()
  const httpServer = http.createServer(app)
  const schema = await buildSchema({
    validate: false,
    resolvers: [UserResolver],
  })

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await server.start()

  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server, { context: async ({ req, res }) => ({ req, res }) }),
  )

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve))
  console.log(`Server ready at http://localhost:${port}/`)

  AppDataSource.initialize()
    .then(() => console.log(`Data source had been initialied.`))
    .catch(error => console.log(`Error during database initialization.`, error))
}
main()
