import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class AdministradorModel extends Model {
    public id!: number
    public rol!: number
    public uuid!: string
    public nombre!: string
    public apellidos!: string
    public usuario!: string
    public password!: string
    public status!: number
    public intentos!: number
    public visible!: number
    public ultimo_acceso!: string

}

AdministradorModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    rol: {
        type: DataTypes.INTEGER
    },
    uuid: {
        type: DataTypes.STRING
    },
    nombre: {
        type: DataTypes.STRING
    },
    apellidos: {
        type: DataTypes.STRING
    },
    usuario: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER
    },
    intentos: {
        type: DataTypes.INTEGER
    },
    visible: {
        type: DataTypes.INTEGER
    },
    ultimo_acceso: {
        type: DataTypes.DATE
    }
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'administradores'
})
