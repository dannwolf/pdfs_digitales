# Changelog

Todos los cambios notables en el proyecto **Sistema de Gestión de Constancias Digitales Municipales** serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-23

### Añadido
- **CRUD Administradores**: Sistema completo de gestión de usuarios administradores
  - Creación, lectura, actualización y eliminación de administradores
  - Gestión de roles y permisos
  - Middleware de roles para control de acceso
  - Middleware de validación de valores (get-values)
  - Relaciones entre administradores y formatos
  - Queries optimizadas para administradores
- **Colección Postman**: Se agrega y actualiza documentación de API en Postman
  - 226 líneas de endpoints documentados
  - Ejemplos de peticiones y respuestas

### Cambiado
- **Refactorización de modelos**:
  - Renombrado: `administrator.model.ts` → `administrador.model.ts`
  - Renombrado: `administrator_formato.model.ts` → `administrador_formato.model.ts`
  - Actualización de relaciones en Sequelize
- **Middleware de headers**: Simplificado de 22 a 1 línea
- **Enumeraciones**: Actualización de roles (3 nuevas definiciones)

### Eliminado
- Modelo obsoleto: `rol-formato.model.ts` (39 líneas removidas)

---

## [0.9.5] - 2025-12-22

### Corregido
- **Bug en Dictámenes**: Corrección de error en controlador de dictámenes
- **Rutas**: Ajuste menor en configuración de rutas

### Añadido
- **Mejoras en Dictámenes**:
  - 110 nuevas líneas de funcionalidad
  - 4 nuevas validaciones en interfaces
  - 16 nuevas queries de base de datos
  - Integración mejorada con licencias de funcionamiento

### Cambiado
- Actualizaciones en modelo de dictámenes (de 10 a 2 campos)
- Eliminación de 2 validaciones redundantes

---

## [0.9.4] - 2025-12-15

### Añadido
- **Mejoras en Licencias Transitorias**:
  - 35 nuevas líneas de lógica de negocio
  - 13 nuevos campos en interfaces
  - 45 nuevos campos en modelo de base de datos
  - Actualización de colección Postman (5 nuevos endpoints)

### Cambiado
- Refactorización de validadores de licencias transitorias
- Optimización de 8 validaciones existentes

---

## [0.9.3] - 2025-12-11

### Añadido
- **Licencias de Funcionamiento**:
  - 53 nuevas líneas en controlador
  - 16 nuevas queries de base de datos
  - Mejoras en rutas de API

### Cambiado
- **Postman**: 166 líneas actualizadas en la colección de Postman

---

## [0.9.2] - 2025-12-05

### Cambiado
- **Configuración**: Actualización de variables de entorno (.env)
  - 4 cambios en configuración de base de datos

---

## [0.9.1] - 2025-12-02-03

### Añadido
- Validaciones opcionales en licencias de funcionamiento

### Cambiado
- **Licencias de Funcionamiento**:
  - Eliminación de campos redundantes en validaciones
  - Simplificación de controlador (13 líneas optimizadas)
- **Variables de entorno**: Limpieza de configuraciones obsoletas (15 líneas removidas)

### Corregido
- 4 validaciones corregidas en validadores de licencias

---

## [0.9.0] - 2025-11-25

### Añadido
- **Actualización masiva de módulos**:
  - **Dictámenes**: 32 nuevas líneas de funcionalidad
  - **Obras Municipales**: 33 nuevas líneas de lógica
  - **Predial**: 43 nuevas líneas de implementación
  - **Transitorias**: 36 nuevas líneas de mejoras
  - **Session Controller**: 12 líneas actualizadas
- **Base de datos**: Actualización de esquema (73 líneas modificadas)
- **Postman**: Grandes actualizaciones (225 nuevos endpoints y ejemplos)

### Cambiado
- Refactorización de queries de administrador (23 líneas)
- Optimización de rutas (8 líneas de mejoras)
- Actualizaciones en controlador de licencias de funcionamiento (26 líneas)

### Eliminado
- 2 validaciones obsoletas en licencias

---

## [0.8.5] - 2025-11-20-24

### Añadido
- Actualizaciones menores en base de datos
- Mejoras en colección Postman
- Cambios en funcionalidad de edición

---

## [0.8.0] - 2025-11-15

### Cambiado
- **Licencias de Funcionamiento**: Eliminación de campos innecesarios en modelo
  - Optimización de estructura de datos
  - Simplificación de validaciones

---

## [0.7.5] - 2025-09-30

### Añadido
- **Integración con Trámites y Servicios**:
  - Campo `folio_solicitud` agregado al sistema
  - Sincronización con sistema externo de trámites municipales
- Configuración para ambiente de testing

---

## [0.7.0] - 2025-09-29

### Cambiado
- **Configuración de Base de Datos**:
  - Ajustes en conexión a base de datos
  - Optimización de parámetros de configuración

---

## [0.6.5] - 2025-09-27

### Añadido
- **Integración completa con Trámites y Servicios**:
  - Sistema de sincronización automática
  - Nuevos endpoints de integración
  - Validación cruzada de folios

---

## [0.6.0] - 2025-09-09-11

### Añadido
- Múltiples mejoras y correcciones
- Ajustes en rutas correctas de archivos
- Optimizaciones generales en controladores

### Cambiado
- Configuraciones de testing
- Actualizaciones en la estructura del proyecto

---

## [0.5.0] - 2025-09-06-07

### Añadido
- Nuevas funcionalidades en todos los módulos principales
- Implementaciones iniciales de características core

---

## [0.1.0] - 2025-02-20

### Añadido
- **Primera versión del proyecto**:
  - Estructura base del backend con Node.js y TypeScript
  - Configuración inicial de Express
  - Modelos de base de datos (Sequelize)
  - Sistema de autenticación con JWT
  - Módulos principales:
    - Licencias de Funcionamiento
    - Constancias Prediales
    - Dictámenes
    - Obras Municipales
    - Licencias Transitorias
  - Middleware de seguridad (Helmet, CORS)
  - Integración con AWS S3
  - Sistema de envío de correos (Nodemailer)
  - Generación de códigos QR
  - Integración SOAP
  - WebSockets con Socket.io
  - Monitoreo con Sentry
  - Colección de Postman inicial

---

## Contribuidores

- **Daniel Solano** - Desarrollo principal y mantenimiento
- **Omar González** - Configuración y optimizaciones
- **Juan Amaya** - Configuraciones de ambiente

---

## Notas de Versiones

### Convenciones de Versión
- **MAJOR.MINOR.PATCH** (Ejemplo: 1.0.0)
  - **MAJOR**: Cambios incompatibles en la API
  - **MINOR**: Nuevas funcionalidades compatibles con versiones anteriores
  - **PATCH**: Correcciones de bugs compatibles con versiones anteriores

### Tipos de Cambios
- **Añadido**: Nuevas características
- **Cambiado**: Cambios en funcionalidad existente
- **Obsoleto**: Características que serán eliminadas
- **Eliminado**: Características eliminadas
- **Corregido**: Correcciones de bugs
- **Seguridad**: Correcciones de vulnerabilidades

---

**Última actualización**: 23 de diciembre de 2025
