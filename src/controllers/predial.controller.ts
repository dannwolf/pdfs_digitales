import validator from 'validator';
import moment from 'moment'
import { Request, Response } from 'express'
import { Soap } from '../helpers/soap'
import { Log } from '../helpers/logs'
import { JsonResponse } from "../enums/jsonResponse";
import { v4 as uuidv4 } from 'uuid'
import { Axios } from '../helpers/axios'
import QRCode from 'qrcode'
import process from "process";
import { PredialQueries } from "../queries/predial.query";
import { Predial } from '../interfaces/predial.interface';
import { PredialValidator } from '../validators/predial.validator';
import { LicenciaFuncionamientoController } from './licencia-funcionamiento.controller';


export class PredialController {
    static predialQueries: PredialQueries = new PredialQueries()
    static soap: Soap = new Soap()
    static log: Log = new Log()
    static axios: Axios = new Axios();
    static predialValidator: PredialValidator = new PredialValidator();

    public async validaPagoPredial(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const folio_pago_predial: string = body.folio_pago_predial == null || validator.isEmpty(body.folio_pago_predial) ?
            errors.push({ message: 'Favor de proporcionar el folio del recibo del pago predial' }) : body.folio_pago_predial

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const data = {
            url: process.env.VALIDA_PAGO_PREDIAL,
            function: 'daoValidaReciboPago',
            args: {
                // tslint:disable-next-line:radix
                parStrReciboPago: folio_pago_predial
            }
        }

        const soap: any = await PredialController.soap.request(data)

        if (soap.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: soap.message }]
            })
        }



        if (!soap.result[0].daoValidaReciboPagoResult) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El folio del recibo proporcionado no existe' }]
            })
        }

        if (soap.result[0].daoValidaReciboPagoResult.CodigoError != "200") {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: soap.result[0].daoValidaReciboPagoResult.MensajeError }]
            })
        }

        if (soap.result[0].daoValidaReciboPagoResult.estatusReciboPago != "A") {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El folio del recibo proporcionado no cuenta con un pago válido' }]
            })
        }

        if (soap.result[0].daoValidaReciboPagoResult.grupoTramiteIdReciboPago != "42") {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El folio del recibo proporcionado no corresponde a un pago predial' }]
            })
        }

        let getClave: string[] = soap.result[0].daoValidaReciboPagoResult.conceptoReciboPago.split(' ') ?? null
        let clave_catastral = getClave.reverse()[0]

        const dataCatastro = {
            url: process.env.DATOS_CATASTRO,
            function: 'daoObtieneDatosPredio',
            args: {
                parStrCveCatastral: clave_catastral,
            }
        }

        const soap2: any = await PredialController.soap.request(dataCatastro)

        if (soap2.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: soap2.message }]
            })
        }

        let manzana = clave_catastral.substring(9, 12)
        let lote = clave_catastral.substring(12)
        let calle = soap2.result[0].daoObtieneDatosPredioResult?.PredioCalle ?? ''
        let numero_exteriror = soap2.result[0].daoObtieneDatosPredioResult?.PredioNumExt ?? ''
        let numero_interior = soap2.result[0].daoObtieneDatosPredioResult?.PredioNumInt ?? ''
        let ubicacion = calle + ' ' + numero_exteriror + ' ' + numero_interior + ', MZA. ' + manzana + ', LTE. ' + lote

        return res.status(JsonResponse.OK).json({
            ok: true,
            catastro: {
                clave_catastral: clave_catastral,
                ubicacion,
                nombre_contribuyente: soap.result[0].daoValidaReciboPagoResult.nombreContribuyente ?? '',
                rfc: soap.result[0].daoValidaReciboPagoResult.rfcContribuyente ?? '',
            }
        })
    }

    public async guardarPredial(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const fecha_oficio: string = body.fecha_oficio == null || validator.isEmpty(body.fecha_oficio) ?
            errors.push({ message: 'Favor de proporcionar la fecha del oficio.' }) : body.fecha_oficio

        const numero_oficio: string = body.numero_oficio == null || validator.isEmpty(body.numero_oficio) ?
            errors.push({ message: 'Favor de proporcionar el numero de oficio.' }) : body.numero_oficio

        const recibo_pago_certificado: string = body.recibo_pago_certificado == null || validator.isEmpty(body.recibo_pago_certificado) ?
            errors.push({ message: 'Favor de proporcionar el recibo de pago del certificado.' }) : body.recibo_pago_certificado

        const folio_pago_predial: string = body.folio_pago_predial == null || validator.isEmpty(body.folio_pago_predial) ?
            errors.push({ message: 'Favor de proporcionar el folio del recibo del pago predial' }) : body.folio_pago_predial

        const origin: number = body.origin == null || validator.isEmpty(body.origin + '') ? 1 : body.origin

        const folio_solicitud: string = body.folio_solicitud == null || validator.isEmpty(body.folio_solicitud) ?
            null : body.folio_solicitud

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const data = {
            url: process.env.VALIDA_PAGO_PREDIAL,
            function: 'daoValidaReciboPago',
            args: {
                // tslint:disable-next-line:radix
                parStrReciboPago: folio_pago_predial
            }
        }

        const soap: any = await PredialController.soap.request(data)

        if (soap.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se puede procesar la información en este momento. Intente más tarde." }]
            })
        }

        let getClave: string[] = soap.result[0].daoValidaReciboPagoResult.conceptoReciboPago.split(' ') ?? null
        let clave_catastral = getClave.reverse()[0]

        const dataCatastro = {
            url: process.env.DATOS_CATASTRO,
            function: 'daoObtieneDatosPredio',
            args: {
                parStrCveCatastral: clave_catastral,
            }
        }

        const soap2: any = await PredialController.soap.request(dataCatastro)

        if (soap2.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se puede procesar la información en este momento. Intente más tarde." }]
            })
        }

        let manzana = clave_catastral.substring(9, 12)
        let lote = clave_catastral.substring(12)
        let calle = soap2.result[0].daoObtieneDatosPredioResult?.PredioCalle ?? ''
        let numero_exteriror = soap2.result[0].daoObtieneDatosPredioResult?.PredioNumExt ?? ''
        let numero_interior = soap2.result[0].daoObtieneDatosPredioResult?.PredioNumInt ?? ''
        let ubicacion = calle + ' ' + numero_exteriror + ' ' + numero_interior + ', MZA. ' + manzana + ', LTE. ' + lote

        let ultimo_periodo_pagado = soap2.result[0].daoObtieneDatosPredioResult?.PredioUltimoPeriodoPagado ?? ''
        let ultimo_ejercicio_pagado = soap2.result[0].daoObtieneDatosPredioResult?.PredioUltimoEjericicioPagado ?? ''


        let predial: Predial = {
            fecha_oficio: moment(fecha_oficio).format('YYYY-MM-DD'),
            numero_oficio,
            recibo_pago_certificado,
            folio_pago_predial,
            rfc: soap.result[0].daoValidaReciboPagoResult.rfcContribuyente ?? '',
            clave_catastral: clave_catastral,
            expediente: moment().format('YYYY'),
            ultimo_bimestre_ejercicio_pagado: ultimo_periodo_pagado + '-' + ultimo_ejercicio_pagado,
            ubicacion,
            nombre_contribuyente: soap2.result[0].daoObtieneDatosPredioResult.ContribuyenteNombreIngresos ?? ''

        }

        const createPredial = await PredialController.predialQueries.create({
            uuid: uuidv4(),
            administrador_id,
            ...predial,
            status: (origin == 2) ? 1 : 0,
            origin,
            folio_solicitud,
            fecha_expiracion: moment().add(3, 'months').format('YYYY-MM-DD'),
        })

        if (!createPredial.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información del predial.' }]
            })
        }

        const createLogAdministrador = await PredialController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha guardado el predial con index: ' + createPredial.predial.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Se ha adjuntado la información correctamente.',
            uuid: createPredial.predial.uuid
        })

    }

    public async detallePredial(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        const errors = []

        const predial_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el predial' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findPredialByUUID = await PredialController.predialQueries.findPredialByUUID(
            predial_uuid,
        )

        if (!findPredialByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos del predial proporcionado.' })
        } else if (findPredialByUUID.predial == null) {
            errors.push({ message: 'El predial proporcionado no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            constancia: findPredialByUUID.predial
        })


    }

    public async listaPrediales(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id

        const findPrediales = await PredialController.predialQueries.findPrediales()

        if (!findPrediales.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener los prediales.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            prediales: findPrediales.prediales
        })
    }

    public async generarFormato(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []
        const predial = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el predial' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findPredialByUUID = await PredialController.predialQueries.findPredialByUUID(predial)

        if (!findPredialByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos del predial proporcionado.' })
        } else if (findPredialByUUID.predial == null) {
            errors.push({ message: 'El predial proporcionado no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const qr = await QRCode.toBuffer(process.env.PLATAFORMA_WEB + findPredialByUUID.predial.uuid + '/predial')
        let qr64 = Buffer.from(qr).toString('base64')

        enum bimestres {
            "primer bimestre" = 1,
            "segundo bimestre" = 2,
            "tercer bimestre" = 3,
            "cuarto bimestre" = 4,
            "quinto bimestre" = 5,
            "sexto bimestre" = 6
        }

        let data = [
            {
                "template": "CERTIFICADO_DE_NO_ADEUDO_DE_IMPUESTO_PREDIAL",
                "certificado": {
                    "numero_oficio": findPredialByUUID.predial.numero_oficio,
                    "expediente": findPredialByUUID.predial.expediente,
                    "numero_recibo": findPredialByUUID.predial.folio_pago_predial,
                    "periodo": bimestres[findPredialByUUID.predial.ultimo_bimestre_ejercicio_pagado.split('-')[0]] + ' del ejercicio fiscal ' + findPredialByUUID.predial.ultimo_bimestre_ejercicio_pagado.split('-')[1],
                    "ubicacion": findPredialByUUID.predial.ubicacion,
                    "clave_catastral": findPredialByUUID.predial.clave_catastral,
                    "nombre": findPredialByUUID.predial.nombre_contribuyente,
                },
            }
        ]

        let options = {
            headers: {
                "X-API-Key": process.env.API_KEY,
            },
            method: 'POST',
            url: process.env.GENERATOR_URL,
            responseType: 'arraybuffer',
            data
        }

        let getPdf = await PredialController.axios.getResponse(options)

        if (getPdf.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas para generar el formato.' }]
            })
        }

        return res.status(JsonResponse.OK).contentType('application/pdf').send(getPdf.result)

    }

    public async confirmar(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const predial_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el predial' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findPredialByUUID = await PredialController.predialQueries.findPredialByUUID(predial_uuid)

        if (findPredialByUUID.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se encontro el predial proporcionado" }]
            })
        }

        const updatePredial = await PredialController.predialQueries.confirmar(findPredialByUUID.predial.uuid)

        if (updatePredial.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "Existen problemas para confirmar el predial proporcionado" }]
            })
        }

        const createLogAdministrador = await PredialController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha confirmado el predial con uuid: ' + predial_uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: "El predial se confirmo correctamente"
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el uuid del predial' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const validarPredialEdicion = await PredialController.predialValidator.validarPredialEdicion({
            uuid,
            ...body
        })

        if (validarPredialEdicion.errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: validarPredialEdicion.errors
            })
        }

        const updatePredial = await PredialController.predialQueries.editarInformacion({
            ...validarPredialEdicion.predial,
        })

        if (updatePredial.ok == false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "Existen problemas para editar la informacion del predial proporcionado" }]
            })
        }

        const createLogAdministrador = await PredialController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha editado el predial con uuid: ' + uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: "La informacion del predial se editó correctamente"
        })
    }
}
