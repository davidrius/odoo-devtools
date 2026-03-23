# OdooDevTools — Extension chrome para desarrolladores Odoo 17

> Herramienta de desarrollo para Odoo 17. Gestiona parámetros de URL, accede al backend desde la web del portal, abre cualquier modelo y monitoriza módulos — todo desde el popup del navegador.

---

## Características

### 🔧 Parámetros automáticos por dominio
- Activa `?debug=1` o `?debug=assets` automáticamente al navegar
- Configura idioma (`?lang=es_ES`) y empresa (`cids=1`) por dominio
- Muestra el nombre de la base de datos del dominio y su fecha de vencimiento
- Recarga la página al cambiar el idioma

### 👁 Modo cliente
- Elimina `debug`, `lang` y `cids` de la URL con un clic
- El background deja de interceptar navegaciones mientras está activo
- Un clic para volver a la configuración de desarrollador

### 🛍 Detección de productos en la tienda
- Detecta URLs tipo `/shop/nombre-producto-123`
- Abre directamente el `product.template` en el backend

### 📋 Detección de registros del portal
- Detecta URLs tipo `/my/orders/303639`, `/my/invoices/303639`, etc.
- Abre el registro directamente en el backend sin necesitar el `access_token`
- Soporta: pedidos, presupuestos, facturas, albaranes, proyectos, tareas

### 🗄 Abrir cualquier modelo
- Escribe el nombre técnico del modelo (`stock.lot`, `res.partner`...)
- Crea un `ir.actions.act_window` temporal en Odoo, navega a él y lo borra automáticamente
- Sin dominios, sin filtros — todos los registros

### 📦 Panel de módulos
- Muestra módulos pendientes de actualizar (`to upgrade`, `to install`, `to remove`)
- Muestra módulos instalados/actualizados en las últimas 2 horas
- Activable/desactivable desde ajustes

### 🏢 Gestión de empresas e idiomas
- Define tus empresas con su `cids` y asígnalas por dominio
- Define tus idiomas con su código y asígnalos por dominio
- Al cambiar de empresa usa el mecanismo nativo de Odoo (`_company_switching`)

### 📤 Exportar / Importar configuración
- Exporta toda tu configuración a un `.json`
- Importa en otro navegador o compártela con un compañero

### 🔴 Badge en el icono
- Verde `1` → `debug=1` activo
- Naranja `A` → `debug=assets` activo  
- Gris `·` → dominio reconocido sin debug
- Ámbar `👁` → modo cliente activo

---

## Instalación

1. Descarga o clona este repositorio
2. Abre Chrome → `chrome://extensions`
3. Activa **Modo desarrollador** (esquina superior derecha)
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del proyecto

---

## Uso rápido

1. Abre el popup y añade tu dominio Odoo (ej: `mi-empresa.odoo.com`)
2. Selecciona el modo debug (`debug=1` o `assets`), idioma y empresa
3. Navega por Odoo — los parámetros se aplican automáticamente

---

## Requisitos

- Chrome 109+ (o cualquier navegador basado en Chromium)
- Odoo 17 (Community o Enterprise)
- Sesión activa en el dominio configurado para las funciones que usan `call_kw`

---

## Permisos utilizados

| Permiso | Motivo |
|---|---|
| `storage` | Guardar configuración de dominios, empresas e idiomas |
| `tabs` | Actualizar la URL del tab activo y leer la URL actual |
| `webNavigation` | Interceptar navegaciones para inyectar parámetros |
| `host_permissions: <all_urls>` | Necesario para interceptar cualquier dominio Odoo configurado |

---

## Tecnología

- Manifest V3
- JavaScript puro (sin frameworks, sin dependencias)
- `chrome.storage.sync` para persistencia
- `call_kw` (JSON-RPC de Odoo) para operaciones con la instancia

---

## Licencia

MIT — libre para uso personal y comercial.
