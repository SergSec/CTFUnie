# Configuración de Calendly

Para que la integración de Calendly funcione correctamente en la página de Consulta Online, sigue estos pasos:

## Pasos para Configurar Calendly

1. **Crear una cuenta en Calendly**
   - Ve a https://calendly.com y crea una cuenta gratuita o de pago

2. **Crear un Tipo de Evento**
   - En tu panel de Calendly, crea un nuevo tipo de evento (por ejemplo, "Consulta Fiscal")
   - Configura la duración, disponibilidad y otros detalles del evento

3. **Obtener la URL del Widget**
   - Ve a la configuración del evento que acabas de crear
   - Haz clic en "Add to website" o "Agregar al sitio web"
   - Selecciona la opción "Inline embed" o "Inserción en línea"
   - Copia la URL que aparece (ejemplo: `https://calendly.com/tu-usuario/consulta-fiscal`)

4. **Configurar la URL en la Aplicación**

   Tienes dos opciones:

   **Opción A: Usar Variable de Entorno (Recomendado)**
   - Crea un archivo `.env` en la carpeta `frontend/`
   - Agrega la siguiente línea:
     ```
     REACT_APP_CALENDLY_URL=https://calendly.com/tu-usuario/consulta-fiscal
     ```
   - Reemplaza `https://calendly.com/tu-usuario/consulta-fiscal` con tu URL real
   - Reinicia el servidor de desarrollo

   **Opción B: Editar el Código Directamente**
   - Abre el archivo `frontend/src/pages/OnlineConsultation.js`
   - Busca la línea que dice:
     ```javascript
     const calendlyUrl = process.env.REACT_APP_CALENDLY_URL || 'https://calendly.com/tu-usuario/consulta-fiscal';
     ```
   - Reemplaza `'https://calendly.com/tu-usuario/consulta-fiscal'` con tu URL real

## Verificación

Una vez configurado, cuando visites la página de Consulta Online (`/consulta-online`), deberías ver el widget de Calendly funcionando correctamente. Si aún ves el mensaje de advertencia, verifica que la URL esté correctamente configurada.

## Notas Importantes

- Asegúrate de que tu evento de Calendly esté configurado como "Público" o que los usuarios puedan acceder a él
- El widget se cargará automáticamente cuando se visite la página
- Si tienes problemas, verifica la consola del navegador para ver si hay errores de carga

