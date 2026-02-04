import validator from "validator";
import { ObraMunicipal } from "../interfaces/obra-municipal.interface"

export class ObraMunicipalValidator {
    public async validarObraMunicipal(data: any) {
        const errors = []
        let obraMunicipal: ObraMunicipal = {}

        try {
            if (!data || Object.keys(data).length === 0) {
                errors.push({ message: 'No data provided' });
                return { errors }
            }

            obraMunicipal.uuid = data.uuid;
            obraMunicipal.nombre_contribuyente = data.nombre_contribuyente && !validator.isEmpty(data.nombre_contribuyente + '') ? data.nombre_contribuyente :
                errors.push({ message: 'El nombre del contribuyente es requerido.' });
            obraMunicipal.domicilio = data.domicilio && !validator.isEmpty(data.domicilio + '') ? data.domicilio :
                errors.push({ message: 'El domicilio es requerido.' });
            obraMunicipal.numero_padron = data.numero_padron && !validator.isEmpty(data.numero_padron + '') ? data.numero_padron :
                errors.push({ message: 'El numero de padron es requerido.' });

            obraMunicipal.periodo = data.bimestre_inicio && data.bimestre_fin && !validator.isEmpty(data.bimestre_inicio + '') && !validator.isEmpty(data.bimestre_fin + '') ? String(data.bimestre_inicio) + '-' + String(data.bimestre_fin) :
                errors.push({ message: 'El periodo es requerido.' });

            obraMunicipal.ejercicio = data.ejercicio && !validator.isEmpty(data.ejercicio + '') ? data.ejercicio :
                errors.push({ message: 'El ejercicio es requerido.' });

            obraMunicipal.giro_secundario = data.giro_secundario && !validator.isEmpty(data.giro_secundario + '') ? data.giro_secundario :
                null;

        } catch (error) {
            console.log(error);
            errors.push({ message: 'Existen problemas al momento de validar los datos de la obra municipal proporcionada.' });
            return { errors };
        }

        return {
            obraMunicipal,
            errors
        }
    }
}