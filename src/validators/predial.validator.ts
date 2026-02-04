import { Predial } from "../interfaces/predial.interface";
import validator from "validator";

export class PredialValidator {
    public async validarPredialEdicion(data: any) {
        const errors = []
        let predial: Predial = {}

        try {
            if (!data || Object.keys(data).length === 0) {
                errors.push({ message: 'No data provided' });
                return { errors }
            }

            predial.uuid = data.uuid;

            predial.ubicacion = data.ubicacion && !validator.isEmpty(data.ubicacion + '') ? data.ubicacion :
                errors.push({ message: 'La ubicacion es requerida.' });
            predial.nombre_contribuyente = data.nombre_contribuyente && !validator.isEmpty(data.nombre_contribuyente + '') ? data.nombre_contribuyente :
                errors.push({ message: 'El nombre del contribuyente es requerido.' });
            predial.rfc = data.rfc && !validator.isEmpty(data.rfc + '') ? data.rfc :
                errors.push({ message: 'El RFC es requerido.' });

        } catch (e) {
            console.log(e);
            errors.push({ message: 'Existen problemas al momento de validar los datos del predial proporcionado.' });
            return { errors };
        }

        return {
            predial,
            errors
        }
    }
}
