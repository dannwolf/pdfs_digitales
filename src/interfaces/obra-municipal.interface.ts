export interface ObraMunicipal {
    uuid?: string
    tipo_obra_municipal?: number
    folio_recibo_cobro?: string
    clave_catastral?: string
    giro_secundario?: string
    periodo?: string | number
    ejercicio?: string | number
    fecha_impresion?: string
    nombre_contribuyente?: string
    rfc?: string
    numero_padron?: string
    domicilio?: string
}
