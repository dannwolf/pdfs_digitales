import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class TransitoriasModel extends Model {
    public id!: number
    public uuid!: string
    public administrador_id!: number
    public numero_autorizacion!: string
    public vigencia!: string
    public fecha_expedicion!: string
    public licencia_funcionamiento!: number
    public predio_id!: number
    public nombre_comercial!: string
    public giro_comercial!: string
    public domicilio_comercial!: string
    public razon_social!: string
    public apellidos!: string
    public nombre!: string
    public rfc!: string
    public clave_persona!: string
    public direccion!: string
    public codigo_postal!: string
    public calle!: string
    public colonia!: string
    public numero_exterior!: string
    public numero_interior!: string
    public status!: number


}

TransitoriasModel.init({
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
    numero_autorizacion: {
        type: DataTypes.STRING
    },
    vigencia: {
        type: DataTypes.DATEONLY
    },
    fecha_expedicion: {
        type: DataTypes.DATEONLY
    },
    licencia_funcionamiento: {
        type: DataTypes.INTEGER
    },
    predio_id: {
        type: DataTypes.INTEGER
    },
    nombre_comercial: {
        type: DataTypes.STRING
    },
    giro_comercial: {
        type: DataTypes.STRING
    },
    domicilio_comercial: {
        type: DataTypes.STRING
    },
    razon_social: {
        type: DataTypes.STRING
    },
    apellidos: {
        type: DataTypes.STRING
    },
    nombre: {
        type: DataTypes.STRING
    },
    rfc: {
        type: DataTypes.STRING
    },
    clave_persona: {
        type: DataTypes.STRING
    },
    direccion: {
        type: DataTypes.STRING
    },
    codigo_postal: {
        type: DataTypes.STRING
    },
    calle: {
        type: DataTypes.STRING
    },
    colonia: {
        type: DataTypes.STRING
    },
    numero_exterior: {
        type: DataTypes.STRING
    },
    numero_interior: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'transitorias'
})
