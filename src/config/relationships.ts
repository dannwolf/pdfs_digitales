/** Aquí importamos todos los modelos creado.
 * De igual forma, en este espacio vamos a declarar cada una de las llaves foreneas.
 *  import { ExampleModel } from '../models/example.model'
 */
import { AdministradorModel } from "../models/administrador.model";
import { RolModel } from "../models/rol.model";
import { FormatoModel } from "../models/formato.model";
import { AdministradorFormatoModel } from "../models/administrador_formato.model";

export default class Relationship {
    static init() {
        /**
         * Example.belongsTo(Foreign_Model_Name, { foreignKey: 'foreign_key_id', as: 'NameModel' })
         */
        AdministradorModel.hasOne(RolModel, { foreignKey: 'id', sourceKey: 'rol', as: 'Rol' });

        AdministradorModel.belongsToMany(FormatoModel, {
            through: AdministradorFormatoModel,
            foreignKey: 'administrador_id',
            otherKey: 'formato_id',
            as: 'Formatos'
        });

        FormatoModel.belongsToMany(AdministradorModel, {
            through: AdministradorFormatoModel,
            foreignKey: 'formato_id',
            otherKey: 'administrador_id',
            as: 'Administradores'
        });

    }
}
