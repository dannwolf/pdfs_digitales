import { Soap } from "../helpers/soap";
import { Request, Response } from 'express'
import { JsonResponse } from "../enums/jsonResponse";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import QRCode from 'qrcode'
import moment from "moment";
import process from "process";
import { Axios } from "../helpers/axios";
import { TransitoriaQueries } from "../queries/transitoria.query";
import { Transitoria } from "../interfaces/transitoria.interface";
import { TransitoriaValidator } from "../validators/transitoria.validator";
import { Log } from "../helpers/logs";

export class TransitoriaController {
    static soap: Soap = new Soap();
    static transitoriaQueries: TransitoriaQueries = new TransitoriaQueries()
    static axios: Axios = new Axios();
    static transitoriaValidator: TransitoriaValidator = new TransitoriaValidator();
    static log: Log = new Log();

    public async guardarTransitoria(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const fecha_expedicion = body.fecha_expedicion && !validator.isEmpty(body.fecha_expedicion + '') ? body.fecha_expedicion :
            errors.push({ message: 'La fecha de expedición es inválida.' })
        const numero_autorizacion = body.numero_autorizacion && !validator.isEmpty(body.numero_autorizacion + '') ? body.numero_autorizacion :
            errors.push({ message: 'El número de autorizacion es inválido.' })
        const vigencia = body.vigencia && !validator.isEmpty(body.vigencia + '') ? body.vigencia :
            errors.push({ message: 'La vigencia es inválida.' })
        // const numero_licencia = body.numero_licencia && !validator.isEmpty(body.numero_licencia + '') ? body.numero_licencia :
        //     errors.push({ message: 'El número de licencia es inválido.' })
        const predio_id = body.predio_id && !validator.isEmpty(body.predio_id + '') ? body.predio_id :
            errors.push({ message: 'El número de predio es inválido.' })

        const nombre_comercial = body.nombre_comercial && !validator.isEmpty(body.nombre_comercial + '') ? body.nombre_comercial :
            errors.push({ message: 'El nombre comercial es inválido.' })

        const giro_comercial = body.giro_comercial && !validator.isEmpty(body.giro_comercial + '') ? body.giro_comercial :
            errors.push({ message: 'El giro comercial es inválido.' })



        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const data = {
            url: process.env.DATOS_PREDIO,
            function: 'daoObtieneDatosPredio_id',
            args: {
                // tslint:disable-next-line:radix
                parIntPredio_id: parseInt(predio_id)
            }
        }

        const soap: any = await TransitoriaController.soap.request(data)

        if (soap.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se puede procesar la información en este momento. Intente más tarde." }]
            })
        }

        if (!soap.result[0].daoObtieneDatosPredio_idResult) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El predio proporcionado no existe' }]
            })
        }

        if (!soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El predio proporcionado no existe' }]
            })
        }

        console.log(soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas);

        let transitoria: Transitoria = {
            numero_autorizacion,
            fecha_expedicion: moment(fecha_expedicion).format('YYYY-MM-DD'),
            vigencia: moment(vigencia).format('YYYY-MM-DD'),
            // licencia_funcionamiento: numero_licencia,
            predio_id,
            nombre_comercial,
            giro_comercial,
            nombre: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.Nombre,
            apellidos: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.ApellidoPaterno + ' ' + soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.ApellidoMaterno,
            razon_social: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.RazonSocial,
            rfc: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.RFC,
            clave_persona: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.CvePersona,
            direccion: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.Direccion,
            codigo_postal: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.CP,
            calle: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.Calle,
            colonia: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.Colonia,
            numero_exterior: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.NumExt,
            numero_interior: soap.result[0].daoObtieneDatosPredio_idResult.claEntPersonas.NumInt,


        }

        let createTransitoria = await TransitoriaController.transitoriaQueries.create({
            uuid: uuidv4(),
            administrador_id,
            ...transitoria
        })

        if (!createTransitoria.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información de la constancia transitoria, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await TransitoriaController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha guardado la constancia transitoria con index: ' + createTransitoria.transitoria.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información de la constancia transitoria se ha guardado correctamente.',
        })
    }

    public async detalleTransitoria(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el uuid de la constancia transitoria' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let transitoria = await TransitoriaController.transitoriaQueries.findTransitoriaByUUID(uuid)

        if (!transitoria.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información de la constancia transitoria, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            constancia: transitoria.transitoria
        })
    }

    public async listarTransitorias(req: Request, res: Response) {
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body

        const administrador_id: number = req.body.administrador_id

        let listarConstanciasTransitorias = await TransitoriaController.transitoriaQueries.findTransitorias()

        if (!listarConstanciasTransitorias.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de consultar la información de las constancias transitorias, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            transitorias: listarConstanciasTransitorias.transitorias,
        })
    }

    public async generarFormato(req: Request, res: Response) {
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const transitoria = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el dictamen' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let findTransitoria = await TransitoriaController.transitoriaQueries.findTransitoriaByUUID(transitoria)

        if (!findTransitoria.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de consultar la información la constancia transitoria, intente más tardes.' }]
            })
        }

        if (!findTransitoria.transitoria) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'La constancia transitoria solicitada no existe.' }]
            })
        }

        const qr = await QRCode.toBuffer(process.env.PLATAFORMA_WEB + findTransitoria.transitoria.uuid + '/transitoria')
        let qr64 = Buffer.from(qr).toString('base64')

        let data = [{
            "template": "CONSTANCIA_TRANSITORIA",
            "constancia": {
                "contribuyente": findTransitoria.transitoria.razon_social ?? '',
                "nombre_comercial": findTransitoria.transitoria.nombre_comercial ?? '',
                "giro_comercial": findTransitoria.transitoria.giro_comercial ?? '',
                "registro_padron": findTransitoria.transitoria.predio_id ?? '',
                "domicilio_comercial": findTransitoria.transitoria.domicilio_comercial ?? '',
                "numero_autorizacion": findTransitoria.transitoria.numero_autorizacion ?? '',
                "fecha_expedicion": findTransitoria.transitoria.fecha_expedicion ?? '',
                "vigencia": findTransitoria.transitoria.vigencia ?? '',
                "codigo_verificacion": qr64 ?? '',
            }
        }]

        let options = {
            headers: {
                "X-API-Key": process.env.API_KEY,
            },
            method: 'POST',
            url: process.env.GENERATOR_URL,
            responseType: 'arraybuffer',
            data
        }

        let getPdf = await TransitoriaController.axios.getResponse(options)

        if (getPdf.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas para generar el formato.' }]
            })
        }

        return res.status(JsonResponse.OK).contentType('application/pdf').send(getPdf.result)
    }

    public async confirmar(req: Request, res: Response) {
        const body = req.body
        const administrador_id = body.administrador_id
        const errors = []

        const transitoria_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la constancia transitoria' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findTransitoria = await TransitoriaController.transitoriaQueries.findTransitoriaByUUID(transitoria_uuid)

        if (findTransitoria.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'La constancia transitoria solicitada no existe.' }]
            })
        }

        const updateTransitoria = await TransitoriaController.transitoriaQueries.confirmar(transitoria_uuid)

        if (!updateTransitoria.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de confirmar la constancia transitoria, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await TransitoriaController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha confirmado la constancia transitoria con uuid: ' + transitoria_uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La constancia transitoria se ha confirmado correctamente.',
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        const body = req.body
        const administrador_id = body.administrador_id
        const errors = []

        const transitoria_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la constancia transitoria' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const validatarTransitoria = await TransitoriaController.transitoriaValidator.validarTransitoriaEdicion({
            uuid: transitoria_uuid, ...body
        })

        if (validatarTransitoria.errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: validatarTransitoria.errors
            })
        }

        const updateTransitoria = await TransitoriaController.transitoriaQueries.editarInformacion({
            ...validatarTransitoria.transitoria,
        })

        if (!updateTransitoria.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar la constancia transitoria, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await TransitoriaController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha editado la constancia transitoria con uuid: ' + transitoria_uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La constancia transitoria se ha editado correctamente.',
        })
    }
}
