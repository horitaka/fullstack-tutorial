require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const { createStore } = require('./utils')
const resolvers = require('./resolvers')

const LaunchAPI = require('./datasources/launch')
const UserAPI = require('./datasources/user')
const IsEmail = require('isemail')

const store = createStore()

const server = new ApolloServer({
  context: async ({ req }) => {
    const auth = (req.headers && req.headers.authorization) || ''
    const email = Buffer.from(auth, 'base64').toString('ascii')
    if (!IsEmail.validate(email)) return { user: null }

    const users = await store.users.findOrCreate({ where: { email } })
    const user = (users && users[0]) || null
    return { user: { ...user.dataValues } }
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
})

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/dev
  `)
})
