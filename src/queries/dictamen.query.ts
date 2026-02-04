import { DictamenesModel } from "../models/dictamenes.model";

export class DictamenQueries {
    public async findDictamenes(data: any) {
        try {
            const dictamenes = await DictamenesModel.findAll({
            })
            return { ok: true, dictamenes }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findDictamenByUUID(uuid: any) {
        try {
            const dictamen = await DictamenesModel.findOne({
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, dictamen }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const dictamen = await DictamenesModel.create(data)
            return { ok: true, dictamen }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async confirmar(uuid: any) {
        try {
            const dictamen = await DictamenesModel.update({
                status: 1
            }, {
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, dictamen }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async editarInformacion(data: any) {
        try {
            const dictamen = await DictamenesModel.update(data, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, dictamen }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async cambiarStatus(data: any) {
        try {
            const dictamen = await DictamenesModel.update({
                status: data.status
            }, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, dictamen }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }
}
