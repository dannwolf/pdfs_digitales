import validator from 'validator';
import moment from 'moment'
import { Request, Response } from 'express'
import { Soap } from '../helpers/soap'
import { Log } from '../helpers/logs'
import { LicenciaFuncionamientoQueries } from "../queries/licencia-funcionamiento.query";
import { JsonResponse } from "../enums/jsonResponse";
import { v4 as uuidv4 } from 'uuid'
import { Axios } from '../helpers/axios'
import QRCode from 'qrcode'
import process from "process";
import { TiposLicencias } from "../enums/tiposLicencias";
import { json } from 'body-parser';
import { LicenciaFuncionamientoValidator } from '../validators/licencia.validator';
import * as ExcelJS from 'exceljs'
export class LicenciaFuncionamientoController {
    static licenciaFuncionamientoQueries: LicenciaFuncionamientoQueries = new LicenciaFuncionamientoQueries()
    static soap: Soap = new Soap()
    static log: Log = new Log()
    static axios: Axios = new Axios();
    static licenciaFuncionamientoValidator: LicenciaFuncionamientoValidator = new LicenciaFuncionamientoValidator()

    public async guardarLicencia(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const numero_licencia: string = body.numero_licencia == null || validator.isEmpty(body.numero_licencia) ?
            errors.push({ message: 'Favor de proporcionar el número de licencia de funcionamiento' }) : body.numero_licencia

        const numero_patente = body.numero_patente == null || validator.isEmpty(body.numero_patente) ?
            null : body.numero_patente

        const horario_operacion = body.horario_operacion == null || validator.isEmpty(body.horario_operacion) ?
            null : body.horario_operacion

        const observaciones = body.observaciones == null || validator.isEmpty(body.observaciones) ?
            null : body.observaciones

        //const fecha_expedicion: string = body.fecha_expedicion == null || validator.isEmpty(body.fecha_expedicion) ? null : body.fecha_expedicion

        const fecha_impresion: string = body.fecha_impresion == null || validator.isEmpty(body.fecha_impresion) ?
            errors.push({ message: 'Favor de proporcionar la fecha de impresión' }) : body.fecha_impresion

        //const vigencia: string = body.vigencia == null || validator.isEmpty(body.vigencia) ? null : body.vigencia

        const numero_expediente: string = body.numero_expediente == null || validator.isEmpty(body.numero_expediente) ?
            errors.push({ message: 'Favor de proporcionar el número de expediente' }) : body.numero_expediente

        // const recibo_pago_certificado: string = body.recibo_pago_certificado == null || validator.isEmpty(body.recibo_pago_certificado) ? null : body.recibo_pago_certificado

        const tipo_licencia: number = body.tipo_licencia == null || validator.isEmpty(body.tipo_licencia + '') ?
            3 : body.tipo_licencia

        const tipo_operacion: number = body.tipo_operacion == null || validator.isEmpty(body.tipo_operacion + '') ?
            null : body.tipo_operacion

        const tipo_zona: number = body.tipo_zona == null || validator.isEmpty(body.tipo_zona + '') ?
            null : body.tipo_zona

        const origin: number = body.origin == null || validator.isEmpty(body.origin + '') ? 1 : body.origin

        const folio_solicitud: string = body.folio_solicitud == null || validator.isEmpty(body.folio_solicitud + '') ?
            null : body.folio_solicitud

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        if (origin && origin == 1) {
            /** Buscamos en la base d edatos si el contribuyente ya tiene adjunto esa clave catastral */
            const findLicenciaFuncionamientoByNumeroLicencia = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicenciaFuncionamientoByNumeroLicencia({
                licencia_funcionamiento_id: numero_licencia,
            })

            if (!findLicenciaFuncionamientoByNumeroLicencia.ok) {
                errors.push({ message: 'Existen problemas al momento de verificar datos de la licencia de funcionamiento proporcionada.' })
            } else if (findLicenciaFuncionamientoByNumeroLicencia.licencia != null) {
                errors.push({ message: 'La licencia proporcionada ya se encuentra registrada.' })
            }

            if (errors.length > 0) {
                return res.status(JsonResponse.BAD_REQUEST).json({
                    ok: false,
                    errors
                })
            }
        }

        const data = {
            url: process.env.DATOS_LICENCIA,
            function: 'daoObtieneDatosLicenciaFuncionamientoId',
            args: {
                // tslint:disable-next-line:radix
                parIntIdComercio: parseInt(numero_licencia)
            }
        }

        const soap: any = await LicenciaFuncionamientoController.soap.request(data)

        if (soap.ok === false) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: soap.message }]
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


        const rfc = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.RFCPersona ?? null
        const licenciaFuncionamientoFolio = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoFolio ?? null
        const razonSocial = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.RazonSocialPersona ?? null
        const nombreEstablecimiento = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.nombrecomercial ?? null
        const giroComercial = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.GirosComercialesDescripcion ?? null
        const giroSecundario = (soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoGiroComercialSecundarios) ? soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoGiroComercialSecundarios[0] : null
        const horarioOperacion = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoEstablecimientoHoraApertura ?? null
        const numeroPatente = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoEstablecimientoNumPatente ?? null
        const habitaciones = 0
        const domicilioFiscal = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.Domicilio_Fiscal ?? null
        const claveCatastral = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.PredioCveCatastral ?? null
        const calle = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.calle ?? null
        const noInterior = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NumInt ?? null
        const noExterior = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NumExt ?? null
        const cp = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.CodigoPostalColonia ?? null
        const colonia = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NombreColonia ?? null
        const localidad = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NombreOficialLocalidad ?? null
        const municipio = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NombreOficialMunicipio ?? null
        const estado = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.NombreEntidadFederativa ?? null
        const estatus = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoStatus ?? null
        const propietarioNombre = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.propietario ?? null
        const fechaInicioOperacion = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.FechaInicioOperacion ?? null
        const ultimoEjercicioPagado = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoUltimoEjercicioPagado ?? null
        const ultimoPeriodoPagado = soap.result[0].daoObtieneDatosLicenciaFuncionamientoIdResult.LicenciasFuncionamientoUltimoPeriodoPagado ?? null

        const createLicencia = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.create({
            uuid: uuidv4(),
            administrador_id,
            tipo_licencia,
            licencia_funcionamiento_id: numero_licencia,
            //fecha_expedicion: null,
            fecha_impresion: moment(fecha_impresion).format('YYYY-MM-DD'),
            //recibo_pago_certificado,
            //vigencia: moment(vigencia).format('YYYY-MM-DD'),
            numero_expediente,
            rfc,
            licencia_funcionamiento_folio: licenciaFuncionamientoFolio,
            razon_social: razonSocial,
            nombre_establecimiento: nombreEstablecimiento,
            giro_comercial: giroComercial,
            giro_secundario: giroSecundario,
            numero_patente: numero_patente,
            habitaciones,
            domicilio_fiscal: domicilioFiscal,
            clave_catastral: claveCatastral,
            calle,
            no_interior: noInterior,
            no_exterior: noExterior,
            cp,
            colonia,
            localidad,
            municipio,
            estado,
            propietario_nombre: propietarioNombre,
            fecha_inicio_operacion: moment(fechaInicioOperacion).format('YYYY-MM-DD'),
            horario_operacion: horario_operacion,
            tipo_operacion: tipo_operacion,
            tipo_zona: tipo_zona,
            observaciones: observaciones,
            ultimo_ejercicio_pagado: ultimoEjercicioPagado,
            ultimo_periodo_pagado: ultimoPeriodoPagado,
            fecha_alta: moment().format('YYYY-MM-DD'),
            estatus_licencia: estatus,
            status: (origin == 2) ? 1 : 0,
            origin,
            folio_solicitud,
            fecha_expiracion: moment().add(3, 'month').format('YYYY-MM-DD')

        })

        if (!createLicencia.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de guardar su licencia.' }]
            })
        }

        const createLogAdministrador = await LicenciaFuncionamientoController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha registrado un nueva licencia de funcionamiento con index: ' + createLicencia.licencia.id,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })


        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Se ha adjuntado la licencia de funcionamiento correctamente.',
            uuid: createLicencia.licencia.uuid
        })
    }

    public async listaLicenciasFuncionamiento(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id

        const errors = []

        const tipo_licencia = req.params.tipo_licencia == null || validator.isEmpty(req.params.tipo_licencia + '') ?
            errors.push({ message: 'Favor de proporcionar el tipo de licencia' }) : req.params.tipo_licencia

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findLicencias = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicencias({
            tipo_licencia
        })

        if (!findLicencias.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener las licencias de funcionamiento.' }]
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            licencias: findLicencias.licencias
        })
    }

    public async detalleLicencia(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        const errors = []

        const licencia = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la licencia' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findLicenciaFuncionamientoByUUID = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicenciaByLicenciaUUID({
            uuid: licencia,
        })

        if (!findLicenciaFuncionamientoByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos de la licencia de funcionamiento proporcionada.' })
        } else if (findLicenciaFuncionamientoByUUID.licencia == null) {
            errors.push({ message: 'La licencia de funcionamiento proporcionada no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        return res.status(JsonResponse.OK).json({
            ok: true,
            constancia: findLicenciaFuncionamientoByUUID.licencia
        })


    }

    public async generarFormato(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const licencia = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la licencia' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findLicenciaFuncionamientoByUUID = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicenciaByLicenciaUUID({
            uuid: licencia,
        })

        if (!findLicenciaFuncionamientoByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos de la licencia de funcionamiento proporcionada.' })
        } else if (findLicenciaFuncionamientoByUUID.licencia == null) {
            errors.push({ message: 'La licencia de funcionamiento proporcionada no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const qr = await QRCode.toBuffer(process.env.PLATAFORMA_WEB + findLicenciaFuncionamientoByUUID.licencia.uuid + '/licencia-funcionamiento')
        let qr64 = Buffer.from(qr).toString('base64')

        let data = [
            {
                "template": "LICENCIA_DE_FUNCIONAMIENTO_MUNICIPAL_V2",
                "licencia": {
                    "nombre_comercial": findLicenciaFuncionamientoByUUID.licencia.nombre_establecimiento ?? '',
                    "giro_comercial": findLicenciaFuncionamientoByUUID.licencia.giro_comercial ?? '',
                    "horario_autorizado": findLicenciaFuncionamientoByUUID.licencia.horario_operacion ?? '',
                    "numero_licencia": findLicenciaFuncionamientoByUUID.licencia.licencia_funcionamiento_id ?? '',
                    "fecha_impresion": moment().format("YYYY-MM-DD"),
                    "codigo_verificacion": qr64 ?? ''
                }
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

        let getPdf = await LicenciaFuncionamientoController.axios.getResponse(options)

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

        const licencia = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la licencia' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findLicenciaFuncionamientoByUUID = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicenciaByLicenciaUUID({
            uuid: licencia,
        })

        if (!findLicenciaFuncionamientoByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos de la licencia de funcionamiento proporcionada.' })
        } else if (findLicenciaFuncionamientoByUUID.licencia == null) {
            errors.push({ message: 'La licencia de funcionamiento proporcionada no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const confirmarLicenciaFuncionamiento = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.confirmar({
            uuid: licencia,
        })

        if (!confirmarLicenciaFuncionamiento.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de confirmar la licencia de funcionamiento.' }]
            })
        }

        const createLogAdministrador = await LicenciaFuncionamientoController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha confirmado la licencia de funcionamiento con uuid: ' + licencia,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: "La licencia de funcionamiento se confirmo correctamente"
        })
    }

    public async editarInformacion(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const licencia = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la licencia' }) : req.params.uuid

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const validateLicenciaFuncionamiento = await LicenciaFuncionamientoController.licenciaFuncionamientoValidator.validarLicenciaFuncionamientoEdicion({
            uuid: licencia,
            ...body
        })

        if (validateLicenciaFuncionamiento.errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: validateLicenciaFuncionamiento.errors
            })
        }

        const editarInformacionLicenciaFuncionamiento = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.editarInformacion({
            ...validateLicenciaFuncionamiento.licencia,
        })

        if (!editarInformacionLicenciaFuncionamiento.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar la licencia de funcionamiento.' }]
            })
        }

        const createLogAdministrador = await LicenciaFuncionamientoController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha editado la licencia de funcionamiento con uuid: ' + licencia,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Información de la licencia de funcionamiento ha sido editada correctamente.'
        })
    }

    public async cambiarStatus(req: Request, res: Response) {
        /** Obtenemos el id del administrador */
        const administrador_id: number = req.body.administrador_id
        /** Obtenemos toda la información que nos envia el cliente */
        const body = req.body
        /** Creamos un array que nos almacenará los errores que surjan en la función */
        const errors = []

        const licencia = req.params.uuid == null || validator.isEmpty(req.params.uuid + '') ?
            errors.push({ message: 'Favor de proporcionar la licencia' }) : req.params.uuid

        const status = req.body.status == null || validator.isEmpty(req.body.status + '') ?
            errors.push({ message: 'Favor de proporcionar el status' }) : req.body.status

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const findLicenciaFuncionamientoByUUID = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicenciaByLicenciaUUID({
            uuid: licencia,
        })

        if (!findLicenciaFuncionamientoByUUID.ok) {
            errors.push({ message: 'Existen problemas al momento de verificar datos de la licencia de funcionamiento proporcionada.' })
        } else if (findLicenciaFuncionamientoByUUID.licencia == null) {
            errors.push({ message: 'La licencia de funcionamiento proporcionada no existe.' })
        }

        if (errors.length > 0) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors
            })
        }

        const cambiarStatusLicenciaFuncionamiento = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.cambiarStatus({
            status: status,
            uuid: licencia,
        })

        if (!cambiarStatusLicenciaFuncionamiento.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de editar la licencia de funcionamiento.' }]
            })
        }

        const createLogAdministrador = await LicenciaFuncionamientoController.log.administrador({
            administrador_id: administrador_id,
            navegador: req.headers['user-agent'],
            accion: 'El administrador ha cambiado el estatus de la licencia de funcionamiento con uuid: ' + licencia,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            fecha_alta: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        return res.status(JsonResponse.OK).json({
            ok: true,
            message: 'Estatus de la licencia de funcionamiento ha sido cambiado correctamente.'
        })
    }

    public async licenciasReportExcel(req: Request, res: Response) {
        const adminInfo = req.body.adminInfo;
        let errors = [];

        const getLicenciasReport = await LicenciaFuncionamientoController.licenciaFuncionamientoQueries.findLicencias({
            tipo_licencia: 3,
        })

        if (!getLicenciasReport.ok) {
            return res.status(JsonResponse.BAD_REQUEST).json({
                ok: false,
                errors: [{ message: 'Existen problemas al momento de obtener las licencias de funcionamiento.' }]
            })
        }

        const licenciasData = []

        for (const licencia of getLicenciasReport.licencias) {
            let data = {
                licencia: licencia.licencia_funcionamiento_id,
                rfc: licencia.rfc,
                propietario_nombre: licencia.propietario_nombre,
                clave_catastral: licencia.clave_catastral,
                nombre_establecimiento: licencia.nombre_establecimiento,
                razon_social: licencia.razon_social,
                numero_patente: licencia.numero_patente,
                numero_expediente: licencia.numero_expediente,
                nombre_comercial: licencia.giro_comercial,
                giro_secundario: licencia.giro_secundario,
                ultima_fecha_pago: licencia.ultimo_ejercicio_pagado + '-' + licencia.ultimo_periodo_pagado,
                vigencia: moment("2026-12-01").format('DD/MM/YYYY'),
                estatus: licencia.status,
            }
            licenciasData.push(data);
        }

        try {
            const buffer = await LicenciaFuncionamientoController.generateExcel(licenciasData)
            res.status(200)
            res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            return res.send(buffer);
        } catch (e) {
            return res.status(400).json({
                ok: false,
                errors: [{ message: 'Problemas para generar el reporte de excel de las licencias de funcionamiento.' }]
            })
        }


    }

    private static async generateExcel(data: any[], type?: string, startDate?: string, endDate?: string) {

        try {
            // Prepare workbook
            const workbook = new ExcelJS.Workbook();

            const worksheet = workbook.addWorksheet('Solicitudes');

            const columnStyle = {
                font: {
                    bold: true
                }
            }

            worksheet.getRow(1).values = ['Licencia Funcionamiento', 'RFC', 'Propietario',
                'Clave Catastral', 'Nombre Establecimiento', 'Razon Social',
                'Numero Patente', 'Numero Expediente', 'Nombre Comercial', 'Giro Secundario', 'Ultima Fecha Pago', 'Vigencia', 'Estatus'];
            worksheet.getRow(1).font = { bold: true }
            worksheet.getRow(1).alignment = { horizontal: 'center' }
            worksheet.autoFilter = 'A1:K1';

            worksheet.columns = [
                { key: 'licencia', width: 30 },
                { key: 'rfc', width: 30 },
                { key: 'propietario_nombre', width: 30 },
                { key: 'clave_catastral', width: 50 },
                { key: 'nombre_establecimiento', width: 30 },
                { key: 'razon_social', width: 30 },
                { key: 'numero_patente', width: 20 },
                { key: 'numero_expediente', width: 20 },
                { key: 'nombre_comercial', width: 20 },
                { key: 'giro_secundario', width: 20 },
                { key: 'ultima_fecha_pago', width: 20 },
                { key: 'vigencia', width: 20 },
                { key: 'estatus', width: 20 },
            ]

            worksheet.getColumn('A').alignment = { horizontal: 'center' }
            worksheet.getColumn('B').alignment = { horizontal: 'center' }
            worksheet.getColumn('C').alignment = { horizontal: 'center' }
            worksheet.getColumn('D').alignment = { horizontal: 'center' }
            worksheet.getColumn('E').alignment = { horizontal: 'center' }
            worksheet.getColumn('F').alignment = { horizontal: 'center' }
            worksheet.getColumn('G').alignment = { horizontal: 'center' }
            worksheet.getColumn('H').alignment = { horizontal: 'center' }
            worksheet.getColumn('I').alignment = { horizontal: 'center' }
            worksheet.getColumn('J').alignment = { horizontal: 'center' }
            worksheet.getColumn('K').alignment = { horizontal: 'center' }
            worksheet.getColumn('L').alignment = { horizontal: 'center' }
            worksheet.getColumn('M').alignment = { horizontal: 'center' }

            const mapped: any[] = data.map(n => ({
                licencia: n.licencia,
                rfc: n.rfc,
                propietario_nombre: n.propietario_nombre,
                clave_catastral: n.clave_catastral,
                nombre_establecimiento: n.nombre_establecimiento,
                razon_social: n.razon_social,
                numero_patente: n.numero_patente,
                numero_expediente: n.numero_expediente,
                nombre_comercial: n.nombre_comercial,
                giro_secundario: n.giro_secundario,
                ultima_fecha_pago: n.ultima_fecha_pago,
                vigencia: n.vigencia,
                estatus: n.estatus,
            }))

            worksheet.addRows(mapped);

            return await workbook.xlsx.writeBuffer({ filename: 'Reporte de solicitudes' })

        } catch (error) {
            console.error('Error generating Excel:', error);
            throw new Error('Error generating Excel');
        }
    }



}
