import { TransitoriasModel } from '../models/transitorias.model'

export class TransitoriaQueries {
    public async findTransitorias() {
        try {
            let transitorias = await TransitoriasModel.findAll();
            return { ok: true, transitorias }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findTransitoriaByUUID(uuid) {
        try {
            let transitoria = await TransitoriasModel.findOne({
                where: {
                    uuid: uuid
                }
            });
            return { ok: true, transitoria }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const transitoria = await TransitoriasModel.create(data)
            return { ok: true, transitoria }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async confirmar(uuid: any) {
        try {
            const transitoria = await TransitoriasModel.update({
                status: 1
            }, {
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, transitoria }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async editarInformacion(data: any) {
        try {
            const transitoria = await TransitoriasModel.update(data, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, transitoria }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }
}
