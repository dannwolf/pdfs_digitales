import { ObrasMunicipalesModel } from "../models/obras-municipales.model";
export class ObraMunicipalQueries {

    public async findObrasMunicipales(data: any) {
        try {
            const obras = await ObrasMunicipalesModel.findAll({
                where: {
                    tipo_obra_municipal: data.tipo_obra_municipal,
                }
            })
            return { ok: true, obrasMunicipales: obras }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findObraByUUID(uuid: any) {
        try {
            const obra = await ObrasMunicipalesModel.findOne({
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, obraMunicipal: obra }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const obra = await ObrasMunicipalesModel.create(data)
            return { ok: true, obra: null }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async confirmar(uuid: any) {
        try {
            const obra = await ObrasMunicipalesModel.update({
                status: 1
            }, {
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, obra: null }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async editarInformacion(data: any) {
        try {
            const obra = await ObrasMunicipalesModel.update(data, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, obra: obra }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }
}
