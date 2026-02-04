import { Op, where } from 'sequelize'
import { AdministradorModel } from '../models/administrador.model'
import { RolModel } from "../models/rol.model";
import { FormatoModel } from "../models/formato.model";
import { AdministradorFormatoModel } from '../models/administrador_formato.model';

export class AdministradorQueries {
    public async findAdministradorByUsuario(data: any) {
        try {
            const administrador = await AdministradorModel.findOne({
                where: {
                    usuario: data.usuario,
                    status: 1
                },
                include: [
                    {
                        model: RolModel, as: 'Rol',
                        required: false,
                        attributes: { exclude: ['status', 'visible', 'scope'] },
                    },
                    {
                        model: FormatoModel, as: 'Formatos',
                        required: false,
                        through: {
                            where: {
                                activo: 1
                            },
                            attributes: []
                        },
                        attributes: { exclude: ['id', 'status', 'descripcion'] }
                    },

                ]
            })
            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async obtenerAdministradores(data: any) {
        try {
            const administradores = await AdministradorModel.findAll({
                attributes: [
                    'uuid', 'rol', 'nombre', 'apellidos', 'usuario',
                    'status'
                ],
                order: [
                    ['nombre', 'ASC']
                ],
                where: {
                    status: { [Op.in]: [0, 1] },
                    visible: { [Op.in]: [1] }
                },
                include: [
                    {
                        model: RolModel, as: 'Rol',
                        required: false,
                        attributes: { exclude: ['status', 'visible', 'scope'] },
                    },
                    {
                        model: FormatoModel, as: 'Formatos',
                        required: false,
                        through: {
                            where: {
                                activo: 1
                            },
                            attributes: []
                        },
                        attributes: { exclude: ['status', 'descripcion'] }
                    },
                ]
            })
            return { ok: true, administradores }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findAdministradorById(data: any) {
        try {
            const administrador = await AdministradorModel.findOne({
                where: {
                    id: data.id
                },
                include: [
                    {
                        model: RolModel, as: 'Rol',
                        required: false,
                        attributes: { exclude: ['status', 'visible', 'scope'] },
                    },
                    {
                        model: FormatoModel, as: 'Formatos',
                        required: false,
                        through: {
                            where: {
                                activo: 1
                            },
                            attributes: []
                        },
                        attributes: { exclude: ['id', 'status', 'descripcion'] }
                    },
                ]
            })
            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async findAdministradorByUUID(uuid: any) {
        try {
            let administrador = await AdministradorModel.findOne({
                where: {
                    uuid: uuid
                }
            })
            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async create(data: any) {
        try {
            const administrador = await AdministradorModel.create({

                rol: data.rol,
                uuid: data.uuid,
                nombre: data.nombre,
                apellidos: data.apellidos,
                usuario: data.usuario,
                password: data.password,
                status: 1,
                visible: 1
            })

            if (administrador) {
                const createAdministradorFormato = await AdministradorFormatoModel.create({
                    administrador_id: administrador.id,
                    formato_id: data.formato_id,
                    activo: 1
                })
            }

            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async update(data: any) {
        console.log(data)
        try {
            const administrador = await AdministradorModel.update({
                nombre: data.nombre,
                apellidos: data.apellidos,
                rol: data.rol,
                usuario: data.usuario,
            }, {
                where: {
                    uuid: data.uuid
                }
            })

            const findAdministradorFormato = await AdministradorFormatoModel.findOne({
                where: {
                    administrador_id: data.administrador_id,
                    formato_id: data.formato_id
                }
            })

            console.log(findAdministradorFormato)

            if (findAdministradorFormato) {
                console.log('entro')
                const updateAdministradorFormato = await AdministradorFormatoModel.update({
                    formato_id: data.formato_id,
                }, {
                    where: {
                        administrador_id: data.administrador_id,
                    }
                })
            } else {
                console.log('entro else')
                const createAdministradorFormato = await AdministradorFormatoModel.create({
                    administrador_id: data.administrador_id,
                    formato_id: data.formato_id,
                    activo: 1
                })
            }

            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async delete(data: any) {
        try {
            const administrador = await AdministradorModel.update({
                status: -1,
            }, {
                where: {
                    uuid: data.uuid
                }
            })
            return { ok: true, administrador }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async obtenerRoles() {
        try {
            const roles = await RolModel.findAll({
                attributes: [
                    'id', 'nombre',
                ],
                where: {
                    status: { [Op.in]: [1] },
                    visible: { [Op.in]: [1] }
                },
            })
            return { ok: true, roles }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }

    public async obtenerFormatos() {
        try {
            const formatos = await FormatoModel.findAll({
                attributes: [
                    'id', 'nombre',
                ],
                where: {
                    status: { [Op.in]: [1] },
                },
            })
            return { ok: true, formatos }
        } catch (e) {
            console.log(e)
            return { ok: false }
        }
    }
}
