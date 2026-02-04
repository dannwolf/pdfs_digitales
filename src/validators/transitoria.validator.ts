import validator from "validator";
import { Transitoria } from "../interfaces/transitoria.interface";

export class TransitoriaValidator {

    public async validarTransitoriaEdicion(data: any) {
        const errors = []
        let transitoria: Transitoria = {}

        try {
            if (!data || Object.keys(data).length === 0) {
                errors.push({ message: 'No data provided' });
                return { errors }
            }

            transitoria.uuid = data.uuid;
            transitoria.nombre_comercial = data.nombre_comercial && !validator.isEmpty(data.nombre_comercial + '') ? data.nombre_comercial :
                errors.push({ message: 'El nombre comercial es requerido.' });
            transitoria.giro_comercial = data.giro_comercial && !validator.isEmpty(data.giro_comercial + '') ? data.giro_comercial :
                null

        } catch (e) {
            console.log(e);
            errors.push({ message: 'Existen problemas al momento de validar los datos del predial proporcionado.' });
            return { errors };
        }

        return {
            transitoria,
            errors
        }
    }
}