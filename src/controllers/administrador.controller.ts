import { JsonResponse } from "../enums/jsonResponse";
import { AdministradorQueries } from "../queries/administrador.query";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator'
import * as bcrypt from 'bcrypt';
import { Log } from "../helpers/logs";
import moment from "moment";


export class AdministradorController {
    static administradorQueries: AdministradorQueries = new AdministradorQueries()
    static log: Log = new Log()

    public async obtenerRoles(req: Request, res: Response) {
        const roles = await AdministradorController.administradorQueries.obtenerRoles()

        if (roles.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener los roles.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            roles: roles.roles
        })
    }

    public async obtenerFormatos(req: Request, res: Response) {
        const formatos = await AdministradorController.administradorQueries.obtenerFormatos()

        if (formatos.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener los formatos.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            formatos: formatos.formatos
        })
    }

    public async listaAdministradores(req: Request, res: Response) {
        const errors = []
        const adminAuth = req.body.adminAuth

        const administradores = await AdministradorController.administradorQueries.obtenerAdministradores({
            rol: adminAuth.rol
        })

        if (administradores.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener los administradores.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            administradores: administradores.administradores
        })
    }

    public async crear(req: Request, res: Response) {
        const errors = []
        const adminAuth = req.body.adminAuth
        const uuid = uuidv4()
        const body = req.body

        const rol = (body.rol_id) && validator.isEmpty(body.rol_id + '') === false ? body.rol_id :
            errors.push({ message: 'El rol es obligatorio.' })

        const nombre = (body.nombre) && validator.isEmpty(body.nombre + '') === false ? body.nombre :
            errors.push({ message: 'El nombre es obligatorio.' })

        const apellidos = (body.apellidos) && validator.isEmpty(body.apellidos + '') === false ? body.apellidos :
            errors.push({ message: 'Los apellidos son obligatorios.' })

        const usuario = (body.usuario) && validator.isEmpty(body.usuario + '') === false ? body.usuario :
            errors.push({ message: 'El usuario es obligatorio.' })

        const password = (body.password) && validator.isEmpty(body.password + '') === false ? body.password :
            errors.push({ message: 'La contraseña es obligatoria.' })

        const formato_id = (body.formato_id) && validator.isEmpty(body.formato_id + '') === false ? body.formato_id :
            errors.push({ message: 'El formato es obligatorio.' })


        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: errors
            })
        }
        const crearAdministrador = await AdministradorController.administradorQueries.create({
            rol: rol,
            uuid: uuid,
            nombre: nombre,
            apellidos: apellidos,
            usuario: usuario,
            password: bcrypt.hashSync(password, 10),
            formato_id: formato_id
        })

        if (crearAdministrador.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de crear el administrador.' }]
            })
        }

        const createLogAdministrador = await AdministradorController.log.administrador({
            administrador_id: adminAuth.id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador a creado un nuevo administrador con el index:' + crearAdministrador.administrador.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Administrador creado exitosamente.'
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        const errors = []
        const adminAuth = req.body.adminAuth
        const body = req.body

        const uuid = (req.params.uuid) && validator.isEmpty(req.params.uuid + '') === false ? req.params.uuid :
            errors.push({ message: 'Favor de proporcionar el usuario a modificar' })

        const nombre = (body.nombre) && validator.isEmpty(body.nombre + '') === false ? body.nombre :
            errors.push({ message: 'El nombre es obligatorio.' })

        const apellidos = (body.apellidos) && validator.isEmpty(body.apellidos + '') === false ? body.apellidos :
            errors.push({ message: 'Los apellidos son obligatorios.' })

        const usuario = (body.usuario) && validator.isEmpty(body.usuario + '') === false ? body.usuario :
            errors.push({ message: 'El usuario es obligatorio.' })

        const rol = (body.rol_id) && validator.isEmpty(body.rol_id + '') === false ? body.rol_id :
            errors.push({ message: 'El rol es obligatorio.' })

        const formato_id = (body.formato_id) && validator.isEmpty(body.formato_id + '') === false ? body.formato_id :
            errors.push({ message: 'El formato es obligatorio.' })

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: errors
            })
        }

        const findAdministrador = await AdministradorController.administradorQueries.findAdministradorByUUID(uuid)

        if (findAdministrador.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar el administrador.' }]
            })
        } else if (findAdministrador.administrador === null) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El administrador no existe.' }]
            })
        }

        const editarAdministrador = await AdministradorController.administradorQueries.update({
            uuid: uuid,
            nombre: nombre,
            apellidos: apellidos,
            usuario: usuario,
            rol: rol,
            formato_id: formato_id,
            administrador_id: findAdministrador.administrador.id
        })

        if (editarAdministrador.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar el administrador.' }]
            })
        }

        const createLogAdministrador = await AdministradorController.log.administrador({
            administrador_id: adminAuth.id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador a editado un administrador con el uuid:' + uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Administrador editado exitosamente.'
        })
    }

    public async eliminarAdministrador(req: Request, res: Response) {
        const errors = []
        const adminAuth = req.body.adminAuth

        const uuid = (req.params.uuid) && validator.isEmpty(req.params.uuid + '') === false ? req.params.uuid :
            errors.push({ message: 'Favor de proporcionar el usuario a eliminar' })

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: errors
            })
        }

        const findAdministrador = await AdministradorController.administradorQueries.findAdministradorByUUID(uuid)

        if (findAdministrador.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar el administrador.' }]
            })
        } else if (findAdministrador.administrador === null) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El administrador no existe.' }]
            })
        }

        const eliminarAdministrador = await AdministradorController.administradorQueries.delete({
            uuid: uuid,
        })

        if (eliminarAdministrador.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de eliminar el administrador.' }]
            })
        }

        const createLogAdministrador = await AdministradorController.log.administrador({
            administrador_id: adminAuth.id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador a eliminado un administrador con el uuid:' + uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Administrador eliminado exitosamente.'
        })
    }

}