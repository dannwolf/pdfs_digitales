/** Importamos librerías a utilizar */
import fs from 'fs'
import jwt from 'jsonwebtoken'
import Cryptr from 'cryptr'
import { Response, Request, NextFunction } from 'express'

export class CheckHeaders {
    /** Este middleware valida que la cabecera de autenticación sea correcta */
    static validateJWTAdministrador(req: Request, res: Response, next: NextFunction) {
        /* Obtenemos la cabecera de autenticación */
        let token = req.get('Authorization')
        let public_key
        /** Dependiendo del modo de desarrollo en el que estemos, vamos a obtener
         * las llaves publicas y privadas para desencriptar la información 
         * obteneida en el token.
         */
        if (process.env.MODE != 'dev') {
            public_key = fs.readFileSync(process.env.PUBLIC_KEY, 'utf8')
        } else {
            public_key = fs.readFileSync('./src/keys/public.pem', 'utf8')
        }

        /** Hacemos uso del controlador Crypter y de sus funciones */
        let cryptr = new Cryptr(process.env.CRYPTR_KEY)
        try {
            /* Primero verificamos que el token proporcionado sea valido */
            let decoded: any = jwt.verify(token, public_key)

            if (!decoded.administrador_id) {
                return res.status(403).json({
                    ok: false,
                    errors: [{ message: 'El usuario no tiene la autenticación correcta' }]
                })
            }

            /*Desencriptamos información deseada del usuario*/
            let administrador_id = cryptr.decrypt(decoded.administrador_id)
            let rol = cryptr.decrypt(decoded.rol)
            /*Retornamos el id del usuario decodificado junto con el token */
            req.body.administrador_id = +administrador_id
            req.body.rol = +rol
        } catch (e) {
            /*Cachamos los errores posibles*/
            return res.status(403).json({
                ok: false,
                errors: [{ message: 'Existe el siguiente problema con la cabecera: ' + e }]
            })
        }
        /** Si se cumple las validaciones correctas, pasamos a la función requerida */
        next()
    }
}
