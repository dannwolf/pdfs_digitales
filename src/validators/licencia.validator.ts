import validator from "validator";
import { LicenciaFuncionamiento } from "../interfaces/licencia.interface"



export class LicenciaFuncionamientoValidator {

    public async validarLicenciaFuncionamientoEdicion(data: any) {
        const errors = []
        let licencia: LicenciaFuncionamiento = {}

        try {
            if (!data || Object.keys(data).length === 0) {
                errors.push({ message: 'No data provided' });
                return { errors }
            }

            licencia.uuid = data.uuid;

            licencia.propietario_nombre = data.propietario_nombre && !validator.isEmpty(data.propietario_nombre + '') ? data.propietario_nombre :
                null;
            licencia.rfc = data.rfc && !validator.isEmpty(data.rfc + '') ? data.rfc :
                null;
            licencia.numero_patente = data.numero_patente && !validator.isEmpty(data.numero_patente + '') ? data.numero_patente :
                null;
            licencia.giro_comercial = data.giro_comercial && !validator.isEmpty(data.giro_comercial + '') ? data.giro_comercial :
                null;
            licencia.giro_secundario = data.giro_secundario && !validator.isEmpty(data.giro_secundario + '') ? data.giro_secundario :
                null;
            licencia.tipo_operacion = data.tipo_operacion && !validator.isEmpty(data.tipo_operacion + '') ? data.tipo_operacion :
                null;
            licencia.tipo_zona = data.tipo_zona && !validator.isEmpty(data.tipo_zona + '') ? data.tipo_zona :
                null;
            licencia.horario_operacion = data.horario_operacion && !validator.isEmpty(data.horario_operacion + '') ? data.horario_operacion :
                null;
            licencia.domicilio_fiscal = data.domicilio_fiscal && !validator.isEmpty(data.domicilio_fiscal + '') ? data.domicilio_fiscal :
                null;
            licencia.observaciones = data.observaciones && !validator.isEmpty(data.observaciones + '') ? data.observaciones :
                null



        } catch (e) {
            console.log(e);
            errors.push({ message: 'Existen problemas al momento de validar los datos de la licencia de funcionamiento proporcionada.' });
            return { errors };
        }

        return {
            licencia,
            errors
        }
    }


}
