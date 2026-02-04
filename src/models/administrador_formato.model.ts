import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class AdministradorFormatoModel extends Model {
    public id: number
    public administrador_id: number
    public formato_id: number
    public activo: number
}

AdministradorFormatoModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    administrador_id: {
        type: DataTypes.INTEGER
    },
    formato_id: {
        type: DataTypes.INTEGER
    },
    activo: {
        type: DataTypes.INTEGER
    },
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'administradores_formatos'
})
