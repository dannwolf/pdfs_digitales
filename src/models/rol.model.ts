import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class RolModel extends Model {
    /** Declaramos cada uno de los atributos del modelo */
    public id!: number
    public nombre!: string
    public status!: number
    public visible!: number


}

/** Inicializamos el modelo a utilizar, debemos establecer cada una de las 
 * propiedades que creamos en la sección anterior.
 */
RolModel.init({
    // Example:
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.NUMBER,
    },
    visible: {
        type: DataTypes.NUMBER,
    },

}, {
    /** Aquí podemos agregar opciones adicionales. Por default. La librería 
     *  interpreta que todas las tablas de la base de datos contienen las columnas:
     *  createdAt y updatedAt. 
     *  En dado caso de que no se cuente con ellas, debemos agregar el siguiente 
     *  regla en este especio: timestamps: false
     */
    sequelize: database,
    tableName: 'roles',
    timestamps: false
})
