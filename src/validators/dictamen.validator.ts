import { Dictamen } from "../interfaces/dictamen.interface";
import validator from "validator";

export class DictamenValidator {
    public async validarDictamen(data: any) {
        const errors = []
        let dictamen: Dictamen = {}

        try {
            if (!data || Object.keys(data).length === 0) {
                errors.push({ message: 'No data provided' });
                return { errors }
            }

            dictamen.uuid = data.uuid;

            dictamen.nombre_comercial = data.nombre_comercial && !validator.isEmpty(data.nombre_comercial + '') ? data.nombre_comercial :
                errors.push({ message: 'El nombre comercial es inválido.' })
            dictamen.razon_social = data.razon_social && !validator.isEmpty(data.razon_social + '') ? data.razon_social :
                errors.push({ message: 'La razón social es inválida.' })
            dictamen.giro = data.giro && !validator.isEmpty(data.giro + '') ? data.giro :
                errors.push({ message: 'El giro es inválido.' })
            dictamen.direccion = data.direccion && !validator.isEmpty(data.direccion + '') ? data.direccion :
                errors.push({ message: 'La dirección es inválida.' })
            dictamen.rfc = data.rfc && !validator.isEmpty(data.rfc + '') ? data.rfc :
                errors.push({ message: 'El RFC es inválido.' })
            dictamen.actividad = data.actividad && !validator.isEmpty(data.actividad + '') ? data.actividad :
                errors.push({ message: 'La actividad es inválida.' })

        } catch (error: any) {
            console.log(error);
            errors.push({ message: 'Existen problemas al momento de validar los datos del dictamen proporcionado.' });
            return { errors };
        }

        return {
            dictamen,
            errors
        }
    }
}