<div align="center">

<img src="icon128.png" alt="OdooDevTools" width="100"/>

# OdooDevTools

**Extensión de navegador pensada para desarrolladores Odoo que necesitan agilizar su flujo de trabajo diario. Automatiza la gestión de parámetros de URL, facilita el acceso al backend desde cualquier página del portal y permite explorar modelos y módulos directamente desde el popup.**

[![Version](https://img.shields.io/badge/version-1.4-blue?style=flat-square)](https://github.com/davidrius/odoo-devtools)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Chrome](https://img.shields.io/badge/Chrome-109%2B-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://github.com/davidrius/odoo-devtools)
[![Firefox](https://img.shields.io/badge/Firefox-121%2B-FF7139?style=flat-square&logo=firefox&logoColor=white)](https://github.com/davidrius/odoo-devtools)
[![Manifest](https://img.shields.io/badge/Manifest-V3-yellow?style=flat-square)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![JavaScript](https://img.shields.io/badge/JavaScript-puro-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://github.com/davidrius/odoo-devtools)

[![Stars](https://img.shields.io/github/stars/davidrius/odoo-devtools?style=flat-square&color=yellow)](https://github.com/davidrius/odoo-devtools/stargazers)
[![Forks](https://img.shields.io/github/forks/davidrius/odoo-devtools?style=flat-square)](https://github.com/davidrius/odoo-devtools/network/members)
[![Issues](https://img.shields.io/github/issues/davidrius/odoo-devtools?style=flat-square)](https://github.com/davidrius/odoo-devtools/issues)
[![Last Commit](https://img.shields.io/github/last-commit/davidrius/odoo-devtools?style=flat-square)](https://github.com/davidrius/odoo-devtools/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/davidrius/odoo-devtools?style=flat-square)](https://github.com/davidrius/odoo-devtools)

</div>

---

## Tabla de contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Uso rápido](#-uso-rápido)
- [Permisos](#-permisos)
- [Tecnología](#-tecnología)
- [Soporte](#-soporte)
- [Licencia](#-licencia)

---

## 🎯 Características

### 🔧 Parámetros automáticos por dominio
Olvídate de escribir `?debug=1` manualmente cada vez que navegas. Configura una vez el modo debug (`debug=1` o `debug=assets`), el idioma y la empresa para cada dominio, y la extensión se encargará de inyectar los parámetros correctos en cada navegación de forma transparente.
También muestra el nombre de la base de datos del dominio y su fecha de vencimiento directamente en el popup.

### 👁 Modo cliente
Cuando necesitas ver la web exactamente como la ve un cliente, el modo cliente elimina todos los parámetros de desarrollo (`debug`, `lang`, `cids`) de la URL con un solo clic. Mientras esté activo, la extensión no interceptará ninguna navegación. Vuelve a tu configuración de desarrollador pulsando de nuevo.

### 🛍 Detección de productos en la tienda
Si estás navegando por la tienda online y necesitas editar un producto, la extensión detecta automáticamente URLs tipo `/shop/nombre-producto-123` y te ofrece abrir el `product.template` correspondiente directamente en el backend, sin tener que buscarlo manualmente.

### 📋 Detección de registros del portal
Al acceder a registros del portal como `/my/orders/303639` o `/my/invoices/303639`, la extensión reconoce el tipo de documento y te permite abrirlo directamente en el backend sin necesitar el `access_token`. Compatible con pedidos, presupuestos, facturas, albaranes, proyectos y tareas.

### 🗄 Abrir cualquier modelo
Escribe el nombre técnico de cualquier modelo de Odoo (`stock.lot`, `res.partner`, `account.move`...) y la extensión creará un `ir.actions.act_window` temporal, navegará directamente a la vista del modelo y eliminará la acción automáticamente después. Acceso instantáneo a cualquier modelo sin tocar el menú de Odoo.

### 📦 Panel de módulos
Un vistazo rápido al estado de tus módulos: cuáles están pendientes de actualizar, instalar o eliminar, y cuáles se han instalado o actualizado en las últimas 8 horas. Ideal para comprobar si un despliegue se aplicó correctamente. Este panel es opcional y se puede activar o desactivar desde los ajustes.

### 🏢 Gestión de empresas e idiomas
Centraliza la gestión de tus empresas e idiomas. Define cada empresa con su identificador `cids` y cada idioma con su código, y asígnalos a los dominios que necesites. Al cambiar de empresa, la extensión utiliza el mecanismo nativo de Odoo (`_company_switching`) para garantizar una transición limpia.

### 📤 Exportar / Importar configuración
Toda tu configuración (dominios, empresas, idiomas, ajustes) se puede exportar a un archivo `.json` para hacer backup o compartirla con compañeros de equipo. Importa la configuración en cualquier otro navegador con un solo clic.

### 🔴 Indicador en el icono
La extensión muestra un pequeño indicador sobre su icono en la barra del navegador para que sepas de un vistazo en qué estado se encuentra:

| Indicador | Significado |
|:---:|---|
| 🟢 `1` | `debug=1` activo |
| 🟠 `A` | `debug=assets` activo |
| ⚫ `·` | Dominio reconocido sin debug |
| 🟡 `👁` | Modo cliente activo |

---

## 🚀 Instalación

### Chrome / Edge / Brave

1. Descarga o clona este repositorio
2. Abre `chrome://extensions`
3. Activa **Modo desarrollador** (esquina superior derecha)
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del proyecto

### Firefox

1. Descarga o clona este repositorio
2. Abre `about:debugging#/runtime/this-firefox`
3. Pulsa **Cargar complemento temporal**
4. Selecciona el archivo `manifest.json` de la carpeta del proyecto

---

## ⚡ Uso rápido

1. Abre el popup y añade tu dominio Odoo (ej: `mi-empresa.odoo.com`)
2. Selecciona el modo debug (`debug=1` o `assets`), idioma y empresa
3. Navega por Odoo — los parámetros se aplican automáticamente

---

## 🔒 Permisos

| Permiso | Motivo |
|---|---|
| `storage` | Guardar configuración de dominios, empresas e idiomas |
| `tabs` | Actualizar la URL del tab activo y leer la URL actual |
| `webNavigation` | Interceptar navegaciones para inyectar parámetros |
| `webRequest` | Detectar peticiones POST para no interferir con formularios |
| `host_permissions` | Necesario para interceptar cualquier dominio Odoo configurado |

---

## 🛠 Tecnología

| | |
|---|---|
| **Manifest** | V3 |
| **Lenguaje** | JavaScript puro — sin frameworks, sin dependencias |
| **Persistencia** | `chrome.storage.sync` |
| **Comunicación con Odoo** | `call_kw` (JSON-RPC) |
| **Compatibilidad** | Chrome 109+ · Firefox 121+ · Edge · Brave |

---

## 🙋 Soporte

**Errores o sugerencias:** [Abrir un issue](https://github.com/davidrius/odoo-devtools/issues)

## 📄 Licencia

Licencia MIT - consulte el archivo [LICENSE](LICENSE) para obtener más detalles.
