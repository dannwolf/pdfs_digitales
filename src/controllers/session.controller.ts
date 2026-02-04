import * as bcrypt from 'bcrypt';
import validator from 'validator';
import moment from 'moment';
import { Request, Response } from 'express';

import { AdministradorQueries } from '../queries/administrador.query';
import { Log } from '../helpers/logs';
import { Roles } from "../enums/roles";
import { JsonResponse } from '../enums/jsonResponse'
import { Crypto } from '../helpers/crypto'
import { FileManager } from '../helpers/files'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import { Payload } from "../helpers/payload";



export class SessionController {
    static salt = bcrypt.genSaltSync(Number(process.env.NO_SALT))
    static log: Log = new Log()
    static administradorQueries: AdministradorQueries = new AdministradorQueries()
    static payload: Payload = new Payload()

    public async loginAdministrador(req: Request, res: Response) {
        const body = req.body
        const errors = []

        const usuario: string = body.usuario == null || validator.isEmpty(body.usuario) === true ?
            errors.push({ message: 'Favor de proporcionar su usuario.' }) : body.usuario

        const password: string = body.password == null || validator.isEmpty(body.password) === true ?
            errors.push({ message: 'Favor de proporcionar la contraseña.' }) : body.password

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findAdministradorByUsuario = await SessionController.administradorQueries.findAdministradorByUsuario({ usuario });

        if (findAdministradorByUsuario.ok === false) {
            errors.push({ message: 'Existen problemas al momento de verificar si el administrador esta dado de alta.' })
        } else if (findAdministradorByUsuario.administrador == null) {
            errors.push({ message: 'El usuario proporcionado no se encuentra dado de alta en el sistema.' })
        } else if (bcrypt.compareSync(password, findAdministradorByUsuario.administrador.password) === false) {
            errors.push({ message: 'Las credenciales no coinciden, favor de proporcionarlas de nuevo.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const result = await SessionController.payload.createTokenAdministrador({
            user_type: 'administrador',
            administrador_id: findAdministradorByUsuario.administrador ? findAdministradorByUsuario.administrador.id : false,
            rol: findAdministradorByUsuario.administrador ? findAdministradorByUsuario.administrador.rol : false
        })

        if (result && result.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de crear el token de autenticación.' }]
            })
        }

        const createLogAdministrador = await SessionController.log.administrador({
            administrador_id: findAdministradorByUsuario.administrador ? findAdministradorByUsuario.administrador.id : false,
            navegador: req.headers['user-agent'],
            accion: 'El administrador a iniciado sesión',
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            token: result ? result.token : false,
            nombre: findAdministradorByUsuario.administrador.nombre + ' ' + findAdministradorByUsuario.administrador.apellidos,
            permisos: (findAdministradorByUsuario.administrador['Formatos'].length > 0) ? findAdministradorByUsuario.administrador['Formatos'] : 'Todas los formatos',
            rol: findAdministradorByUsuario.administrador['Rol'] ? findAdministradorByUsuario.administrador['Rol'] : false,
            message: "Inicio de sesión"
        })
    }

}
