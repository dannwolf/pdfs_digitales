import { Model, DataTypes } from 'sequelize'
import { database } from '../config/database'

export class FormatoModel extends Model {
    /** Declaramos cada uno de los atributos del modelo */
    public id!: number
    public uuid!: string
    public nombre!: string
    public descripcion!: string
    public status!: string


}

/** Inicializamos el modelo a utilizar, debemos establecer cada una de las 
 * propiedades que creamos en la sección anterior.
 */
FormatoModel.init({
    // Example:
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
    },
    descripcion: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.NUMBER,
    }
}, {
    /** Aquí podemos agregar opciones adicionales. Por default. La librería 
     *  interpreta que todas las tablas de la base de datos contienen las columnas:
     *  createdAt y updatedAt. 
     *  En dado caso de que no se cuente con ellas, debemos agregar el siguiente 
     *  regla en este especio: timestamps: false
     */
    sequelize: database,
    tableName: 'formatos',
    timestamps: false
})
