import { Soap } from "../helpers/soap";
import { DictamenQueries } from "../queries/dictamen.query";
import { Request, Response } from 'express'
import { JsonResponse } from "../enums/jsonResponse";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import QRCode from 'qrcode'
import moment from "moment";
import { Dictamen } from "../interfaces/dictamen.interface";
import process from "process";
import { Axios } from "../helpers/axios";
import { DictamenValidator } from "../validators/dictamen.validator";
import { Log } from '../helpers/logs'

export class DictamenController {
    static soap: Soap = new Soap();
    static dictamenQueries: DictamenQueries = new DictamenQueries()
    static axios: Axios = new Axios();
    static dictamenValidator: DictamenValidator = new DictamenValidator();
    static log: Log = new Log();

    public async guardarDictamen(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const fecha_oficio = body.fecha_oficio && !validator.isEmpty(body.fecha_oficio + '') ? body.fecha_oficio :
            errors.push({ message: 'La fecha del oficio es requerido.' })
        const numero_oficio = body.numero_oficio && !validator.isEmpty(body.numero_oficio + '') ? body.numero_oficio :
            errors.push({ message: 'El número de oficio es requerido.' })

        const numero_expediente = body.numero_expediente && !validator.isEmpty(body.numero_expediente + '') ? body.numero_expediente :
            errors.push({ message: 'El número de expediente es requerido.' })

        const numero_licencia = body.numero_licencia && !validator.isEmpty(body.numero_licencia + '') ? body.numero_licencia :
            errors.push({ message: 'El número de licencia es requerido.' })

        const actividad = body.actividad && !validator.isEmpty(body.actividad + '') ? body.actividad :
            errors.push({ message: 'La actividad es requerida.' })
        const pase_caja: string = body.pase_caja == null || validator.isEmpty(body.pase_caja) ?
            errors.push({ message: 'Favor de proporcionar el folio del pase de caja' }) : body.pase_caja


        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }


        const dataValidaPaseCaja = {
            url: process.env.VALIDAR_FOLIO_PC,
            function: 'daoValidaPagoPaseCaja',
            args: {
                // tslint:disable-next-line:radix
                parStrFolioPaseCaja: pase_caja,
            }
        }

        const soapValidaPaseCaja: any = await DictamenController.soap.request(dataValidaPaseCaja)

        if (soapValidaPaseCaja.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se puede procesar la información en este momento. Intente más tarde." }]
            })
        }

        if (!soapValidaPaseCaja.result[0].daoValidaPagoPaseCajaResult) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El folio del pase de caja proporcionado no existe' }]
            })
        }

        const statusPaseCajaNoPagado = ['PP', 'CA']

        if (statusPaseCajaNoPagado.includes(soapValidaPaseCaja.result[0].daoValidaPagoPaseCajaResult.SolicitudEstado)) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El folio del pase de caja proporcionado no se encuentra pagado' }]
            })
        }

        const data = {
            url: process.env.DATOS_LICENCIA,
            function: 'daoObtieneDatosLicenciaFuncionamientoId',
            args: {
                // tslint:disable-next-line:radix
                parIntIdComercio: parseInt(numero_licencia)
            }
        }

        const soap: any = await DictamenController.soap.request(data)

        if (soap.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: "No se puede procesar la información en este momento. Intente más tarde." }]
            })
        }

        if (!soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'La licencia proporcionada no existe' }]
            })
        }

        if (!soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoStatus) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'La licencia proporcionada no existe' }]
            })
        }

        let dictamen: Dictamen = {
            numero_oficio,
            fecha_oficio: moment(fecha_oficio).format('YYYY-MM-DD'),
            numero_expediente,
            pase_caja,
            licencia_funcionamiento: numero_licencia,
            actividad,
            razon_social: soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.RazonSocialPersona,
            nombre_comercial: soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.nombrecomercial,
            direccion: soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.Domicilio_Fiscal,
            rfc: soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.RFCPersona,
            giro: soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.GirosComercialesDescripcion,


        }

        let createDictamen = await DictamenController.dictamenQueries.create({
            uuid: uuidv4(),
            administrador_id,
            ...dictamen
        })

        if (!createDictamen.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar la información del dictamen, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await DictamenController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha registrado un nuevo dictamen con index: ' + createDictamen.dictamen.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información del dictamen se ha guardado correctamente.',
        })
    }

    public async detalleDictamen(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const uuid = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el uuid del dictamen' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let dictamen = await DictamenController.dictamenQueries.findDictamenByUUID(uuid)

        if (!dictamen.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener la información del dictamen, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            constancia: dictamen.dictamen
        })
    }

    public async listarDictamenes(req: Request, res: Response) {
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body

        const administrador_id: number = req.body.administrador_id

        let listarDictamenes = await DictamenController.dictamenQueries.findDictamenes({})

        if (!listarDictamenes.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de consultar la información del dictamen, intente más tardes.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            dictamenes: listarDictamenes.dictamenes,
        })
    }

    public async generarFormato(req: Request, res: Response) {
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const dictamen = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar el dictamen' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let findDictamen = await DictamenController.dictamenQueries.findDictamenByUUID(dictamen)

        if (!findDictamen.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de consultar la información del dictamen, intente más tardes.' }]
            })
        }

        if (!findDictamen.dictamen) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El dictamen solicitado no existe.' }]
            })
        }

        let data = [
            {
                "template": "DICTAMEN_APROBATORIO_BAJO_RIESGO",
                "dictamen": {
                    "nombre_comercial": findDictamen.dictamen.nombre_comercial,
                    "razon_social": findDictamen.dictamen.razon_social,
                    "giro_comercial": findDictamen.dictamen.giro,
                    "domicilio_comercial": findDictamen.dictamen.direccion,
                    "rfc": findDictamen.dictamen.rfc,
                    "actividad": findDictamen.dictamen.actividad,
                    "numero_oficio": findDictamen.dictamen.numero_oficio,
                    "numero_expediente": findDictamen.dictamen.numero_expediente,
                    "folio": 'FD-' + moment().unix(),
                    "fecha_impresion": findDictamen.dictamen.fecha_impresion,
                }
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

        let getPdf = await DictamenController.axios.getResponse(options)

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

        const uuid = req.params.uuid && !validator.isEmpty(req.params.uuid + '') ? req.params.uuid :
            errors.push({ message: 'Favor de proporcionar el uuid del dictamen.' })

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        let confirmar = await DictamenController.dictamenQueries.confirmar(uuid)

        if (!confirmar.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de confirmar la información del dictamen, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await DictamenController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha confirmado el dictamen con uuid: ' + uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información del dictamen se ha confirmado correctamente.',
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const uuid = req.params.uuid && !validator.isEmpty(req.params.uuid + '') ? req.params.uuid :
            errors.push({ message: 'Favor de proporcionar el uuid del dictamen.' })

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const validarDictamen = await DictamenController.dictamenValidator.validarDictamen({ uuid, ...body })

        if (validarDictamen.errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: validarDictamen.errors
            })
        }

        let editarInformacion = await DictamenController.dictamenQueries.editarInformacion({
            ...validarDictamen.dictamen,
        })

        if (!editarInformacion.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar la información del dictamen, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await DictamenController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha editado el dictamen con uuid: ' + uuid,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'La información del dictamen se ha editado correctamente.',
        })
    }

    public async cambiarStatus(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const dictamen = req.params.uuid && !validator.isEmpty(req.params.uuid + '') ? req.params.uuid :
            errors.push({ message: 'Favor de proporcionar el uuid del dictamen.' })

        const status = req.body.status && !validator.isEmpty(req.body.status + '') ? req.body.status :
            errors.push({ message: 'Favor de proporcionar el status del dictamen.' })

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findDictamenByUUID = await DictamenController.dictamenQueries.findDictamenByUUID(dictamen)

        if (!findDictamenByUUID.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de buscar el dictamen, intente más tardes.' }]
            })
        } else if (!findDictamenByUUID.dictamen) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'El dictamen proporcionado no existe.' }]
            })
        }

        let cambiarStatus = await DictamenController.dictamenQueries.cambiarStatus({
            uuid: dictamen,
            status
        })

        if (!cambiarStatus.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de cambiar el status del dictamen, intente más tardes.' }]
            })
        }

        const createLogAdministrador = await DictamenController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha cambiado el status del dictamen con uuid: ' + dictamen,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'El status del dictamen se ha cambiado correctamente.',
        })
    }
}