import express from 'express'

/** Importamos todos los controladores disponibles */
import { SessionController } from '../controllers/session.controller'
import { LicenciaFuncionamientoController } from "../controllers/licencia-funcionamiento.controller";
import { PredialController } from "../controllers/predial.controller";
import { ObraMunicipalController } from "../controllers/obra-municipal.controller";
import { DictamenController } from "../controllers/dictamen.controller";
import { TransitoriaController } from "../controllers/transitoria.controller";
import { AdministradorController } from "../controllers/administrador.controller";

/** Importamos todos los middlewares disponibles: */
import { CheckHeaders } from '../middlewares/headers'
import { SentryLogs } from '../middlewares/scope_logs'
import { GetValue } from '../middlewares/get-values';




export class Routes {
    public sessionController: SessionController = new SessionController()
    public licenciaFuncionamientoController: LicenciaFuncionamientoController = new LicenciaFuncionamientoController()
    public predialController: PredialController = new PredialController()
    public obraMunicipalController: ObraMunicipalController = new ObraMunicipalController()
    public dictamenController: DictamenController = new DictamenController()
    public transitoriaController: TransitoriaController = new TransitoriaController()
    public administradorController: AdministradorController = new AdministradorController()

    public routes(app: express.Application): void {
        /** Adjuntamos el tipo de petición que debe mandar el cliente para acceder
         *  al recurso: GET, POST, PUT, ETC
        */

        // Routes for user sessions
        app.route('/api/session/administrador').post(this.sessionController.loginAdministrador)

        app.route('/api/roles').get(CheckHeaders.validateJWTAdministrador, this.administradorController.obtenerRoles)
        app.route('/api/formatos').get(CheckHeaders.validateJWTAdministrador, this.administradorController.obtenerFormatos)

        app.route('/api/administradores').get(CheckHeaders.validateJWTAdministrador, GetValue.administrador, this.administradorController.listaAdministradores)
        app.route('/api/administrador/crear').post(CheckHeaders.validateJWTAdministrador, GetValue.administrador, this.administradorController.crear)
        app.route('/api/administrador/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, GetValue.administrador, this.administradorController.editarInformacion)
        app.route('/api/administrador/eliminar/:uuid').delete(CheckHeaders.validateJWTAdministrador, GetValue.administrador, this.administradorController.eliminarAdministrador)

        app.route('/api/licencia-funcionamiento/crear').post(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.guardarLicencia)
        app.route('/api/licencias-funcionamiento/:tipo_licencia').get(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.listaLicenciasFuncionamiento)
        app.route('/api/licencia-funcionamiento/detalle/:uuid').get(this.licenciaFuncionamientoController.detalleLicencia)
        app.route('/api/licencia-funcionamiento/generar-formato/:uuid').get(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.generarFormato)
        app.route('/api/licencia-funcionamiento/confirmar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.confirmar)
        app.route('/api/licencia-funcionamiento/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.editarInformacion)
        app.route('/api/licencia-funcionamiento/cambiar-status/:uuid').put(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.cambiarStatus)
        app.route('/api/licencia-funcionamiento/reporte/excel').get(CheckHeaders.validateJWTAdministrador, this.licenciaFuncionamientoController.licenciasReportExcel)

        app.route('/api/predial/valida-pago').post(CheckHeaders.validateJWTAdministrador, this.predialController.validaPagoPredial)
        app.route('/api/prediales').get(CheckHeaders.validateJWTAdministrador, this.predialController.listaPrediales)
        app.route('/api/predial/adjuntar-informacion').post(CheckHeaders.validateJWTAdministrador, this.predialController.guardarPredial)
        app.route('/api/predial/detalle/:uuid').get(CheckHeaders.validateJWTAdministrador, this.predialController.detallePredial)
        app.route('/api/predial/generar-formato/:uuid').get(CheckHeaders.validateJWTAdministrador, this.predialController.generarFormato)
        app.route('/api/predial/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.predialController.editarInformacion)
        app.route('/api/predial/confirmar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.predialController.confirmar)

        app.route('/api/obra-municipal/adjuntar-informacion').post(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.guardarObraMunicipal)
        app.route('/api/obras-municipales/:tipo_obra_municipal').get(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.listarObrasMunicipales)
        app.route('/api/obra-municipal/detalle/:uuid').get(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.detalleObraMunicipal)
        app.route('/api/obra-municipal/generar-formato/:uuid').get(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.generarFormato)
        app.route('/api/obra-municipal/confirmar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.confirmar)
        app.route('/api/obra-municipal/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.obraMunicipalController.editarInformacion)

        app.route('/api/dictamen/adjuntar-informacion').post(CheckHeaders.validateJWTAdministrador, this.dictamenController.guardarDictamen)
        app.route('/api/dictamenes').get(CheckHeaders.validateJWTAdministrador, this.dictamenController.listarDictamenes)
        app.route('/api/dictamen/detalle/:uuid').get(CheckHeaders.validateJWTAdministrador, this.dictamenController.detalleDictamen)
        app.route('/api/dictamen/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.dictamenController.editarInformacion)
        app.route('/api/dictamen/generar-formato/:uuid').get(CheckHeaders.validateJWTAdministrador, this.dictamenController.generarFormato)
        app.route('/api/dictamen/confirmar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.dictamenController.confirmar)
        app.route('/api/dictamen/cambiar-status/:uuid').put(CheckHeaders.validateJWTAdministrador, this.dictamenController.cambiarStatus)

        app.route('/api/transitoria/adjuntar-informacion').post(CheckHeaders.validateJWTAdministrador, this.transitoriaController.guardarTransitoria)
        app.route('/api/transitorias').get(CheckHeaders.validateJWTAdministrador, this.transitoriaController.listarTransitorias)
        app.route('/api/transitoria/detalle/:uuid').get(CheckHeaders.validateJWTAdministrador, this.transitoriaController.detalleTransitoria)
        app.route('/api/transitoria/editar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.transitoriaController.editarInformacion)
        app.route('/api/transitoria/confirmar/:uuid').put(CheckHeaders.validateJWTAdministrador, this.transitoriaController.confirmar)
        app.route('/api/transitoria/generar-formato/:uuid').get(CheckHeaders.validateJWTAdministrador, this.transitoriaController.generarFormato)
    }
}
