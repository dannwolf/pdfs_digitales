import server from './config/app';
const port = process.env.LISTEN_PORT
const version = process.version

/** Activamos el servidor */
server.listen(port, () => console.log(`API is running. port: ${port}, Version node: ${version}`))
