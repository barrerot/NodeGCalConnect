
# NodeGCalConnect

NodeGCalConnect es una API desarrollada con Express.js que permite a los usuarios gestionar eventos de Google Calendar basándose en parámetros de consulta específicos. Esta solución backend está configurada para interactuar con la API de Google Calendar utilizando autenticación JWT para acceder de forma segura.

## Características

- Conexión segura con Google Calendar API.
- Gestión de eventos: búsqueda, creación, actualización y eliminación de eventos.
- Filtración de eventos por palabras clave en el resumen del evento.

## Prerrequisitos

Antes de comenzar, asegúrate de tener los siguientes requisitos previos instalados:
- Node.js
- npm (Viene con Node.js)

## Configuración

1. **Clona el repositorio**
   \`\`\`bash
   git clone https://github.com/barrerot/NodeGCalConnect.git
   cd NodeGCalConnect
   \`\`\`

2. **Instala las dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configuración de variables de entorno**
   Crea un archivo \`.env\` en el directorio raíz y añade las siguientes variables:
   \`\`\`
   PORT=3000
   CALENDAR_ID=tu_id_de_calendario@group.calendar.google.com
   \`\`\`

### Credenciales de Google

4. **Creación del archivo credentials.json**

Para autenticar la API de Google Calendar, necesitas crear un archivo \`credentials.json\` que contenga las credenciales de servicio de Google. Sigue estos pasos para obtener y configurar tus credenciales:

1. **Accede a la Consola de Google Cloud Platform (GCP):**
   - Visita [Google Cloud Console](https://console.cloud.google.com/) y inicia sesión con tu cuenta de Google.

2. **Crea un nuevo proyecto:**
   - En la barra de navegación superior, selecciona o crea un nuevo proyecto.

3. **Habilita la API de Google Calendar:**
   - Navega a \`APIs y servicios > Biblioteca\`.
   - Busca "Google Calendar API" y habilita esta API para tu proyecto.

4. **Crea credenciales de cuenta de servicio:**
   - Ve a \`APIs y servicios > Credenciales\`.
   - Haz clic en \`Crear credenciales\` y selecciona \`Cuenta de servicio\`.
   - Completa los detalles requeridos y selecciona el rol de \`Editor\`.
   - Descarga el archivo JSON que contiene las credenciales.

5. **Guarda el archivo descargado como \`credentials.json\`:**
   - Renombra el archivo descargado a \`credentials.json\`.
   - Guarda este archivo en el directorio raíz de tu proyecto.

## Uso

Para iniciar el servidor, ejecuta el siguiente comando:

\`\`\`bash
npm start
\`\`\`

Para desarrollo, puedes utilizar:

\`\`\`bash
npm run dev
\`\`\`

Esto iniciará el servidor en modo desarrollo con nodemon, el cual reiniciará automáticamente el servidor al realizar cambios en los archivos.

## Endpoints

### **GET \`/events\`**

Parámetros de consulta:
- \`day\`: Fecha específica de los eventos (formato YYYY-MM-DD).
- \`start\`: Fecha de inicio para la búsqueda de eventos (formato YYYY-MM-DD).
- \`end\`: Fecha de fin para la búsqueda de eventos (formato YYYY-MM-DD).
- \`summary\`: Texto para filtrar eventos por resumen.

Respuestas:
- \`200\`: Éxito - Retorna los eventos que coinciden con los criterios de búsqueda.
- \`400\`: Error de cliente - Parámetros de consulta inválidos.
- \`500\`: Error de servidor - Problemas al consultar Google Calendar.

### **POST \`/events\`**

Crea un nuevo evento en Google Calendar.

Cuerpo de la solicitud (JSON):
\`\`\`json
{
  "summary": "Título del evento",
  "location": "Ubicación del evento",
  "description": "Descripción del evento",
  "start": {
    "dateTime": "2023-05-20T10:00:00+02:00",
    "timeZone": "Europe/Madrid"
  },
  "end": {
    "dateTime": "2023-05-20T12:00:00+02:00",
    "timeZone": "Europe/Madrid"
  }
}
\`\`\`

Respuestas:
- \`201\`: Éxito - Evento creado.
- \`400\`: Error de cliente - Datos de evento inválidos.
- \`500\`: Error de servidor - Problemas al crear el evento.

### **PUT \`/events/:eventId\`**

Actualiza un evento existente en Google Calendar.

Parámetros de URL:
- \`eventId\`: ID del evento a actualizar.

Cuerpo de la solicitud (JSON):
\`\`\`json
{
  "summary": "Nuevo título del evento",
  "location": "Nueva ubicación del evento",
  "description": "Nueva descripción del evento",
  "start": {
    "dateTime": "2023-05-20T10:00:00+02:00",
    "timeZone": "Europe/Madrid"
  },
  "end": {
    "dateTime": "2023-05-20T12:00:00+02:00",
    "timeZone": "Europe/Madrid"
  }
}
\`\`\`

Respuestas:
- \`200\`: Éxito - Evento actualizado.
- \`400\`: Error de cliente - Datos de evento inválidos.
- \`404\`: No encontrado - El evento no existe.
- \`500\`: Error de servidor - Problemas al actualizar el evento.

### **DELETE \`/events/:eventId\`**

Elimina un evento existente en Google Calendar.

Parámetros de URL:
- \`eventId\`: ID del evento a eliminar.

Respuestas:
- \`204\`: Éxito - Evento eliminado.
- \`404\`: No encontrado - El evento no existe.
- \`500\`: Error de servidor - Problemas al eliminar el evento.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Esto significa que tienes amplia libertad para distribuir, modificar, incorporar en otros proyectos y más, siempre y cuando incluyas el texto original de la licencia MIT con cualquier copia del software.

Para más detalles, ver el archivo [LICENSE](LICENSE_MIT.md).
