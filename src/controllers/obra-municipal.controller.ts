import { ObraMunicipalQueries } from "../queries/obras-municipal.query";
import { Request, Response } from 'express'
import { JsonResponse } from "../enums/jsonResponse";
import validator from "validator";
import { Soap } from "../helpers/soap";
import { Log } from "../helpers/logs";
import { Axios } from "../helpers/axios";
import { ObraMunicipal } from "../interfaces/obra-municipal.interface";
import { v4 as uuidv4 } from "uuid";
import QRCode from 'qrcode'
import { TiposObras } from "../enums/tiposObras";
import moment from "moment";
import { ObraMunicipalValidator } from "../validators/obra-municipal.validator";

export class ObraMunicipalController {
    static obraMunicipalQueries: ObraMunicipalQueries = new ObraMunicipalQueries()
    static soap: Soap = new Soap()
    static log: Log = new Log()
    static axios: Axios = new Axios();
    static obraMunicipalValidator: ObraMunicipalValidator = new ObraMunicipalValidator();

    public async guardarObraMunicipal(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const tipo_obra_municipal: number = body.tipo_obra_municipal == null || validator.isEmpty(body.tipo_obra_municipal + '') === true ?
            errors.push({ message: 'Favor de proporcionar el tipo de obra municipal.' }) : body.tipo_obra_municipal

        const folio_recibo_cobro: string = body.folio_recibo_cobro == null || validator.isEmpty(body.folio_recibo_cobro) === true ?
            errors.push({ message: 'Favor de proporcionar el folio del recibo de cobro.' }) : body.folio_recibo_cobro

        const clave_catastral: string = body.clave_catastral == null || validator.isEmpty(body.clave_catastral) === true ?
            errors.push({ message: 'Favor de proporcionar la clave catastral.' }) : body.clave_catastral

        const giro_secundario: string = body.giro_secundario ?? + ''

        const bimestre_inicio: any = body.bimestre_inicio == null || validator.isEmpty(body.bimestre_inicio + '') === true ?
            errors.push({ message: 'Favor de proporcionar el bimestre de inicio.' }) : body.bimestre_inicio

        const bimestre_fin: any = body.bimestre_fin == null || validator.isEmpty(body.bimestre_fin + '') === true ?
            errors.push({ message: 'Favor de proporcionar el bimestre final.' }) : body.bimestre_fin

        const ejercicio: any = body.ejercicio == null || validator.isEmpty(body.ejercicio + '') === true ?
            errors.push({ message: 'Favor de proporcionar el ejercicio.' }) : body.ejercicio

        const fecha_impresion: string = body.fecha_impresion == null || validator.isEmpty(body.fecha_impresion) === true ?
            errors.push({ message: 'Favor de proporcionar la fecha de impresión.' }) : body.fecha_impresion

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const dataCatastro = {
            url: process.env.DATOS_CATASTRO,
            function: 'daoObtieneDatosPredio',
            args: {
                parStrCveCatastral: clave_catastral,
            }
        }

        const soap2: any = await ObraMunicipalController.soap.request(dataCatastro)

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
        let contribuyente = soap2.result[0].daoObtieneDatosPredioResult?.ContribuyenteNombreIngresos ?? ''
        let numero_padron = soap2.result[0].daoObtieneDatosPredioResult?.PredioId ?? ''

        let obraMunicipal: ObraMunicipal = {
            tipo_obra_municipal,
            folio_recibo_cobro,
            clave_catastral,
            giro_secundario,
            periodo: bimestre_inicio + '-' + bimestre_fin,
            ejercicio,
            fecha_impresion: moment(fecha_impresion).format('YYYY-MM-DD'),
            nombre_contribuyente: contribuyente,
            numero_padron,
            domicilio: ubicacion
        }

        let createObraMunicipal = await ObraMunicipalController.obraMunicipalQueries.create({
            uuid: uuidv4(),
            administrador_id,
            ...obraMunicipal
        })

        if (!createObraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información de la constancia, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await ObraMunicipalController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha guardado la obra municipal con index: ' + createObraMunicipal.obra.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información de la obra municipal se ha guardado correctamente.',
        })

    }

    public async detalleObraMunicipal(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el uuid de la obra municipal' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let obraMunicipal = await ObraMunicipalController.obraMunicipalQueries.findObraByUUID(uuid)

        if (!obraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información de la obra municipal, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            obra_municipal: obraMunicipal.obraMunicipal
        })
    }

    public async listarObrasMunicipales(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const tipo_obra_municipal = req.params.tipo_obra_municipal == null || validator.isEmpty(req.params.tipo_obra_municipal + '') ?
            errors.push({ message: 'Favor de proporcionar el tipo de obra municipal' }) : req.params.tipo_obra_municipal

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let obrasMunicipales = await ObraMunicipalController.obraMunicipalQueries.findObrasMunicipales({ tipo_obra_municipal })

        if (!obrasMunicipales.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información de las obras municipales, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            obras_municipales: obrasMunicipales.obrasMunicipales
        })
    }

    public async generarFormato(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const obra_municipal_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el UUID de la obra municipal' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let findObraMunicipal = await ObraMunicipalController.obraMunicipalQueries.findObraByUUID(obra_municipal_uuid)

        if (!findObraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información de la obra municipal, intente más tardes.' }]
            })
        }

        if (findObraMunicipal.obraMunicipal == null) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'No se ha encontrado la información de la obra municipal.' }]
            })
        }

        const qr = await QRCode.toBuffer(process.env.PLATAFORMA_WEB + findObraMunicipal.obraMunicipal.uuid + '/obra-municipal')
        let qr64 = Buffer.from(qr).toString('base64')

        enum bimestres {
            "primer" = 1,
            "segundo" = 2,
            "tercer" = 3,
            "cuarto" = 4,
            "quinto" = 5,
            "sexto" = 6
        }

        let del = findObraMunicipal.obraMunicipal.periodo.split('-')[0]
        let al = findObraMunicipal.obraMunicipal.periodo.split('-')[1]


        let data = [
            {
                "template": (findObraMunicipal.obraMunicipal.tipo_obra_municipal == TiposObras.OBRAMUNICIPAL) ? "NO_ADEUDO_POR_OBRA" : "NO_ADEUDO_COPERACION_POR_OBRA",
                "constancia": {
                    "contribuyente": findObraMunicipal.obraMunicipal.nombre_contribuyente ?? '',
                    "domicilio_fiscal": findObraMunicipal.obraMunicipal.domicilio ?? '',
                    "clave_catastral": findObraMunicipal.obraMunicipal.clave_catastral ?? '',
                    "giro_secundario": findObraMunicipal.obraMunicipal.giro_secundario ?? '',
                    "numero_padron": findObraMunicipal.obraMunicipal.numero_padron ?? '',
                    "periodo_del": bimestres[del] ?? '',
                    "bimestre_de": findObraMunicipal.obraMunicipal.ejercicio ?? moment().format('YYYY'),
                    "periodo_al": bimestres[al] ?? '',
                    "bimestre_a": findObraMunicipal.obraMunicipal.ejercicio ?? moment().format('YYYY'),
                    "folio": findObraMunicipal.obraMunicipal.folio_recibo_cobro ?? '',
                    "fecha_impresion": findObraMunicipal.obraMunicipal.fecha_impresion ?? '',
                    "codigo_verificacion": qr64
                },
            },
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

        let getPdf = await ObraMunicipalController.axios.getResponse(options)

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

        const obra_municipal_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el UUID de la obra municipal' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let findObraMunicipal = await ObraMunicipalController.obraMunicipalQueries.findObraByUUID(obra_municipal_uuid)

        if (!findObraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información de la obra municipal, intente más tardes.' }]
            })
        }

        if (findObraMunicipal.obraMunicipal == null) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'No se ha encontrado la información de la obra municipal.' }]
            })
        }

        let updateObraMunicipal = await ObraMunicipalController.obraMunicipalQueries.confirmar(obra_municipal_uuid)

        if (!updateObraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información de la constancia, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await ObraMunicipalController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha confirmado la obra municipal con uuid: ' + obra_municipal_uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información de la obra municipal se ha guardado correctamente.',
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const obra_municipal_uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el UUID de la obra municipal' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const validarObraMunicipal = await ObraMunicipalController.obraMunicipalValidator.validarObraMunicipal({ uuid: obra_municipal_uuid, ...body })

        if (validarObraMunicipal.errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: validarObraMunicipal.errors
            })
        }

        let updateObraMunicipal = await ObraMunicipalController.obraMunicipalQueries.editarInformacion({
            ...validarObraMunicipal.obraMunicipal
        })

        if (!updateObraMunicipal.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información de la constancia, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await ObraMunicipalController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha editado la obra municipal con uuid: ' + obra_municipal_uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información de la obra municipal se ha guardado correctamente.',
        })
    }
}
