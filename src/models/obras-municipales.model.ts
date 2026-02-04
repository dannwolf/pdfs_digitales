import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class ObrasMunicipalesModel extends Model {
    public id!: number
    public uuid!: string
    public administrador_id!: number
    public tipo_obra_municipal!: number
    public folio_recibo_cobro!: string
    public rfc!: string
    public clave_catastral!: string
    public giro_secundario!: string
    public nombre_contribuyente!: string
    public periodo!: string
    public ejercicio!: string
    public fecha_impresion!: string
    public numero_padron!: string
    public domicilio!: string
    public status!: number

}

ObrasMunicipalesModel.init({
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
    tipo_obra_municipal: {
        type: DataTypes.INTEGER
    },
    folio_recibo_cobro: {
        type: DataTypes.STRING
    },
    rfc: {
        type: DataTypes.STRING
    },
    clave_catastral: {
        type: DataTypes.STRING
    },
    giro_secundario: {
        type: DataTypes.STRING
    },
    nombre_contribuyente: {
        type: DataTypes.STRING
    },
    periodo: {
        type: DataTypes.STRING
    },
    ejercicio: {
        type: DataTypes.STRING
    },
    fecha_impresion: {
        type: DataTypes.STRING
    },
    numero_padron: {
        type: DataTypes.STRING
    },
    domicilio: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER
    },
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'obras_municipales'
})
