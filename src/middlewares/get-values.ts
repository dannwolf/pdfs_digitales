import { Response, Request, NextFunction } from 'express'

import { AdministradorQueries } from "../queries/administrador.query";
import { JsonResponse } from '../enums/jsonResponse';

export class GetValue {
    static administradorQueries: AdministradorQueries = new AdministradorQueries()

    static async administrador(req: Request, res: Response, next: NextFunction) {
        const errors = []

        /** Variable con contendrá la información del usuario encontrado en la db */
        let adminAuth: any = null;

        /** Buscamos si el usuario existe en la base de datos */
        const getAdminInfo = await GetValue.administradorQueries.findAdministradorById({ id: req.body.administrador_id })

        /** Validamos las futuras permutaciones al no encontrar registro en la base de datos */
        if (getAdminInfo.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: ['Existen problemas para obtener la información del usuario']
            })
        } else if (getAdminInfo.administrador == null) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: ['El usuario no esta registrado en el sistema.']
            })
        } else {
            adminAuth = getAdminInfo.administrador
        }
        /** Creamos un objeto que contenga al usuario encontrado en la base de datos */
        req.body.adminAuth = adminAuth
        next()
    }
}
