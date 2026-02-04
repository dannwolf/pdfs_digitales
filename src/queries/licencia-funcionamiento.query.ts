import * as sequelize from 'sequelize'
import { Op } from 'sequelize'
import { database } from '../config/database'
import { LicenciaFuncionamientoModel } from '../models/licencia-funcionamiento.model'

export class LicenciaFuncionamientoQueries {

    public async findLicencias(data: any) {
        try {
            const licencias = await LicenciaFuncionamientoModel.findAll({
                where: {
                    tipo_licencia: data.tipo_licencia
                },
                order: [["id", "DESC"]]
            })
            return { ok: true, licencias }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findLicenciaFuncionamientoByNumeroLicencia(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.findOne({
                where: {
                    licencia_funcionamiento_id: data.licencia_funcionamiento_id
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findLicenciaByLicenciaUUID(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.findOne({
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }


    public async findLicenciaByLicenciaFolio(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.findOne({
                where: {
                    [Op.and]: [
                        { licencia_funcionamiento_id: data.licencia_funcionamiento_id },
                        { licencia_funcionamiento_folio: data.licencia_funcionamiento_folio },
                    ]
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.create({
                uuid: data.uuid,
                administrador_id: data.administrador_id,
                tipo_licencia: data.tipo_licencia,
                licencia_funcionamiento_id: data.licencia_funcionamiento_id,
                fecha_expedicion: data.fecha_expedicion,
                fecha_impresion: data.fecha_impresion,
                recibo_pago_certificado: data.recibo_pago_certificado,
                vigencia: data.vigencia,
                numero_expediente: data.numero_expediente,
                rfc: data.rfc,
                licencia_funcionamiento_folio: data.licencia_funcionamiento_folio,
                razon_social: data.razon_social,
                nombre_establecimiento: data.nombre_establecimiento,
                giro_comercial: data.giro_comercial,
                giro_secundario: data.giro_secundario,
                horario_operacion: data.horario_operacion,
                tipo_operacion: data.tipo_operacion,
                tipo_zona: data.tipo_zona,
                numero_patente: data.numero_patente,
                habitaciones: data.habitaciones,
                domicilio_fiscal: data.domicilio_fiscal,
                clave_catastral: data.clave_catastral,
                calle: data.calle,
                no_interior: data.no_interior,
                no_exterior: data.no_exterior,
                cp: data.cp,
                colonia: data.colonia,
                localidad: data.localidad,
                municipio: data.municipio,
                estado: data.estado,
                propietario_nombre: data.propietario_nombre,
                fecha_inicio_operacion: data.fecha_inicio_operacion,
                observaciones: data.observaciones,
                ultimo_ejercicio_pagado: data.ultimo_ejercicio_pagado,
                ultimo_periodo_pagado: data.ultimo_periodo_pagado,
                renovable: data.renovable,
                estatus_licencia: data.estatus_licencia,
                status: data.status,
                origin: data.origin,
                folio_solicitud: data.folio_solicitud,
                fecha_expiracion: data.fecha_expiracion
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async upsert(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.upsert({
                id: data.id,
                administrador_id: data.administrador_id,
                rfc: data.rfc,
                licencia_funcionamiento_id: data.licencia_funcionamiento_id,
                licencia_funcionamiento_folio: data.licencia_funcionamiento_folio,
                razon_social: data.razon_social,
                nombre_establecimiento: data.nombre_establecimiento,
                habitaciones: data.habitaciones,
                domicilio_fiscal: data.domicilio_fiscal,
                clave_catastral: data.clave_catastral,
                calle: data.calle,
                no_interior: data.no_interior,
                no_exterior: data.no_exterior,
                cp: data.cp,
                colonia: data.colonia,
                localidad: data.localidad,
                municipio: data.municipio,
                estado: data.estado,
                propietario_nombre: data.propietario_nombre,
                fecha_inicio_operacion: data.fecha_inicio_operacion,
                ultimo_ejercicio_pagado: data.ultimo_ejercicio_pagado,
                ultimo_periodo_pagado: data.ultimo_periodo_pagado,
                fecha_alta: data.fecha_alta,
                renovable: data.renovable,
                estatus: data.estatus
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async confirmar(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.update({
                status: 1
            }, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async editarInformacion(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.update({
                propietario_nombre: data.propietario_nombre,
                numero_patente: data.numero_patente,
                giro_comercial: data.giro_comercial,
                giro_secundario: data.giro_secundario,
                tipo_operacion: data.tipo_operacion,
                tipo_zona: data.tipo_zona,
                horario_operacion: data.horario_operacion,
                domicilio_fiscal: data.domicilio_fiscal,
                observaciones: data.observaciones,

            }, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async cambiarStatus(data: any) {
        try {
            const licencia = await LicenciaFuncionamientoModel.update({
                status: data.status
            }, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, licencia }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

}
