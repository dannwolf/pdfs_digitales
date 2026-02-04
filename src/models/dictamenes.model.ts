import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class DictamenesModel extends Model {
    public id!: number
    public uuid!: string
    public administrador_id!: number
    public numero_oficio!: string
    public fecha_oficio!: string
    public pase_caja!: string
    public folio_electronico!: string
    public fecha_impresion!: string
    public numero_expediente!: string
    public licencia_funcionamiento!: string
    public nombre_comercial!: string
    public razon_social!: string
    public giro!: string
    public direccion!: string
    public rfc!: string
    public actividad!: string
    public status!: number

}

DictamenesModel.init({
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
    pase_caja: {
        type: DataTypes.STRING
    },
    folio_electronico: {
        type: DataTypes.STRING
    },
    fecha_impresion: {
        type: DataTypes.STRING
    },
    numero_expediente: {
        type: DataTypes.STRING
    },
    licencia_funcionamiento: {
        type: DataTypes.STRING
    },
    nombre_comercial: {
        type: DataTypes.STRING
    },
    razon_social: {
        type: DataTypes.STRING
    },
    giro: {
        type: DataTypes.STRING
    },
    direccion: {
        type: DataTypes.STRING
    },
    rfc: {
        type: DataTypes.STRING
    },
    actividad: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER
    },
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'dictamenes'
})
