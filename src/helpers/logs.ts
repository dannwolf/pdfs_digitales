import { BitacoraAdministradorModel } from "../models/bitacora_administrador.model"


export class Log {
    public async administrador(data: any) {
        try {
            const log = await BitacoraAdministradorModel.create({
                administrador_id: data.administrador_id,
                navegador: data.navegador,
                ip: data.ip,
                accion: data.accion,
                fecha_alta: data.fecha_alta
            })
            return { ok: true, log }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

}
