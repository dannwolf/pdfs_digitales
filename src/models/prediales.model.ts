import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class PredialModel extends Model {
    public id!: number
    public uuid!: string
    public administrador_id!: number
    public numero_oficio!: string
    public fecha_oficio!: string
    public recibo_pago_certificado!: string
    public folio_pago_predial!: string
    public rfc!: string
    public clave_catastral!: string
    public nombre_contribuyente!: string
    public expediente!: string
    public ultimo_bimestre_ejercicio_pagado!: string
    public ubicacion!: string
    public status!: number
    public origin!: number
    public folio_solicitud!: string
    public fecha_expiracion!: string

}

PredialModel.init({
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
    numero_oficio: {
        type: DataTypes.STRING
    },
    fecha_oficio: {
        type: DataTypes.STRING
    },
    recibo_pago_certificado: {
        type: DataTypes.STRING
    },
    folio_pago_predial: {
        type: DataTypes.STRING
    },
    rfc: {
        type: DataTypes.STRING
    },
    clave_catastral: {
        type: DataTypes.STRING
    },
    nombre_contribuyente: {
        type: DataTypes.STRING
    },
    expediente: {
        type: DataTypes.STRING
    },
    ultimo_bimestre_ejercicio_pagado: {
        type: DataTypes.STRING
    },
    ubicacion: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER
    },
    origin: {
        type: DataTypes.TINYINT
    },
    folio_solicitud: {
        type: DataTypes.STRING
    },
    fecha_expiracion: {
        type: DataTypes.DATEONLY
    }
}, {
    // Then add the configuration:
    sequelize: database,
    timestamps: false,
    tableName: 'prediales'
})
