/* Libraries to create the jwt */
import jwt from 'jsonwebtoken'
import fs from 'fs'
import moment from 'moment'
import Cryptr from 'cryptr'
import * as Sentry from "@sentry/node";

export class Payload {

    public async createTokenAdministrador(data) {
        try {
            let private_key: any

            if (process.env.MODE != 'dev') {
                private_key = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')
            } else {
                private_key = fs.readFileSync('./src/keys/private.pem', 'utf8')
            }

            let cryptr = new Cryptr(process.env.CRYPTR_KEY)

            const administrador_id = cryptr.encrypt((data.administrador_id))
            const rol = cryptr.encrypt((data.rol))

            let token = jwt.sign({
                administrador_id: administrador_id,
                rol: rol,
            }, private_key, { algorithm: 'RS256', expiresIn: '9h' })

            return { ok: true, token }

        } catch (e) {
            Sentry.captureException(e);
            console.log('Error payload a las: ' + moment().format('YYYY-MM-DD HH:mm:ss') + ', ' + e)
            return { ok: false }
        }



    }
}
