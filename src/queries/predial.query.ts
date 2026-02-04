import * as sequelize from 'sequelize'
import { Op } from 'sequelize'
import { database } from '../config/database'
import { PredialModel } from '../models/prediales.model'

export class PredialQueries {

    public async findPrediales() {
        try {
            const prediales = await PredialModel.findAll({
                where: {}
            })
            return { ok: true, prediales }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findPredialByUUID(uuid: any) {
        try {
            const predial = await PredialModel.findOne({
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, predial }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const predial = await PredialModel.create(data)
            return { ok: true, predial }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async confirmar(uuid: any) {
        try {
            const predial = await PredialModel.update({
                status: 1
            }, {
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, predial }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async editarInformacion(data: any) {
        try {
            const predial = await PredialModel.update(data, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, predial }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }
}
