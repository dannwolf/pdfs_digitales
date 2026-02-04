import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class LicenciaFuncionamientoModel extends Model {
    public id!: number
    public uuid!: string
    public administrador_id!: number
    public tipo_licencia!: number
    public licencia_funcionamiento_id!: string
    public fecha_expedicion!: string
    public fecha_impresion!: string
    public recibo_pago_certificado!: string
    public vigencia!: string
    public numero_expediente!: string
    public rfc!: string
    public licencia_funcionamiento_folio!: string
    public clave_catastral!: string
    public razon_social!: string
    public nombre_establecimiento!: string
    public giro_comercial!: string
    public giro_secundario!: string
    public tipo_operacion!: number
    public tipo_zona!: number
    public horario_operacion!: string
    public numero_patente!: string
    public habitaciones!: number
    public domicilio_fiscal!: number
    public calle!: string
    public no_interior!: string
    public no_exterior!: string
    public cp!: string
    public colonia!: number
    public localidad!: number
    public municipio!: string
    public estado!: string
    public propietario_nombre!: string
    public fecha_inicio_operacion!: string
    public observaciones!: string
    public estatus_licencia!: string
    public ultimo_ejercicio_pagado!: string
    public ultimo_periodo_pagado!: string
    public renovable!: number
    public status!: number
    public origin!: number
    public folio_solicitud!: string
    public fecha_expiracion!: string
}

// Initialize the class with the properties exactly as they are in the Database.
// Do not initialize utility columns like timestamps
LicenciaFuncionamientoModel.init({
    // Example:
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    uuid: {
        type: DataTypes.STRING
    },
    administrador_id: {
        type: DataTypes.INTEGER
    },
    tipo_licencia: {
        type: DataTypes.INTEGER
    },
    licencia_funcionamiento_id: {
        type: DataTypes.STRING
    },
    fecha_expedicion: {
        type: DataTypes.STRING
    },
    fecha_impresion: {
        type: DataTypes.STRING
    },
    recibo_pago_certificado: {
        type: DataTypes.STRING
    },
    vigencia: {
        type: DataTypes.STRING
    },
    numero_expediente: {
        type: DataTypes.STRING
    },
    rfc: {
        type: DataTypes.STRING
    },
    licencia_funcionamiento_folio: {
        type: DataTypes.STRING
    },
    clave_catastral: {
        type: DataTypes.STRING
    },
    razon_social: {
        type: DataTypes.STRING
    },
    nombre_establecimiento: {
        type: DataTypes.STRING
    },
    giro_comercial: {
        type: DataTypes.STRING
    },
    giro_secundario: {
        type: DataTypes.STRING
    },
    horario_operacion: {
        type: DataTypes.STRING
    },
    tipo_operacion: {
        type: DataTypes.INTEGER
    },
    tipo_zona: {
        type: DataTypes.INTEGER
    },
    numero_patente: {
        type: DataTypes.STRING
    },
    habitaciones: {
        type: DataTypes.STRING
    },
    domicilio_fiscal: {
        type: DataTypes.STRING
    },
    calle: {
        type: DataTypes.STRING
    },
    no_interior: {
        type: DataTypes.STRING
    },
    no_exterior: {
        type: DataTypes.STRING
    },
    cp: {
        type: DataTypes.STRING
    },
    colonia: {
        type: DataTypes.STRING
    },
    localidad: {
        type: DataTypes.STRING
    },
    municipio: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    },
    propietario_nombre: {
        type: DataTypes.STRING
    },
    fecha_inicio_operacion: {
        type: DataTypes.STRING
    },
    observaciones: {
        type: DataTypes.STRING
    },
    estatus_licencia: {
        type: DataTypes.STRING
    },
    ultimo_ejercicio_pagado: {
        type: DataTypes.STRING
    },
    ultimo_periodo_pagado: {
        type: DataTypes.STRING
    },
    renovable: {
        type: DataTypes.TINYINT
    },
    status: {
        type: DataTypes.TINYINT
    },
    origin: {
        type: DataTypes.TINYINT
    },
    folio_solicitud: {
        type: DataTypes.STRING
    },
    fecha_expiracion: {
        type: DataTypes.DATEONLY
    },
    fecha_alta: {
        type: DataTypes.STRING
    },
}, {
    // Then add the configuration:
    sequelize: database,
    timestamps: false,
    tableName: 'licencias_funcionamiento'
})
