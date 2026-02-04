import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class BitacoraAdministradorModel extends Model {
    public id!: number;
    public administrador_id!: number;
    public navegador!: string;
    public ip!: string;
    public accion!: string;
    public fecha_alta!: Date;
}

BitacoraAdministradorModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    administrador_id: {
        type: DataTypes.INTEGER
    },
    navegador: {
        type: DataTypes.STRING
    },
    ip: {
        type: DataTypes.STRING
    },
    accion: {
        type: DataTypes.STRING
    },
    fecha_alta: {
        type: DataTypes.DATE
    }
}, {
    sequelize: database,
    timestamps: false,
    tableName: 'bitacora_administradores'
})




