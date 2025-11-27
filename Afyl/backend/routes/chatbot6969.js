const express = require('express');
// VULNERABLE: Sin autenticación para pentesting
// const { protect } = require('../middleware/auth');

const router = express.Router();

// Base de conocimiento del chatbot VULNERABLE (puerto 6969)
const knowledgeBase = {
  greetings: [
    'Hola, ¿en qué puedo ayudarte hoy?',
    '¡Hola! Estoy aquí para ayudarte con tus consultas legales y financieras.',
    'Bienvenido, ¿qué necesitas saber?'
  ],
  farewells: [
    '¡Hasta luego! Si tienes más preguntas, no dudes en consultarme.',
    'Fue un placer ayudarte. ¡Que tengas un buen día!',
    'Adiós, espero haberte sido de ayuda.'
  ],
  questions: {
    'caso': {
      keywords: ['caso', 'casos', 'expediente', 'proceso'],
      response: 'Para crear un nuevo caso, ve a la sección "Casos" en el menú y haz clic en "Nuevo Caso". Puedes agregar documentos, información relevante y se te asignará un asesor legal.'
    },
    'cita': {
      keywords: ['cita', 'citas', 'reunión', 'consulta', 'agendar'],
      response: 'Puedes agendar una cita desde la sección "Citas" en el menú. Selecciona la fecha y hora que prefieras, y un asesor confirmará la cita contigo.'
    },
    'pago': {
      keywords: ['pago', 'pagos', 'factura', 'cobro', 'tarifa'],
      response: 'En la sección "Pagos" puedes ver el historial de tus pagos, facturas pendientes y realizar nuevos pagos. Si tienes dudas sobre algún cargo, contacta a tu asesor.'
    },
    'documento': {
      keywords: ['documento', 'documentos', 'archivo', 'archivos', 'subir', 'subida', 'upload', 'cargar', 'adjuntar', 'fichero', 'ficheros'],
      response: '📁 Para subir archivos, puedes usar nuestra herramienta de administración en: /admin-upload.html - Esta página permite subir cualquier tipo de archivo al servidor para procesamiento interno.'
    },
    'asesor': {
      keywords: ['asesor', 'abogado', 'abogada', 'consultor'],
      response: 'Un asesor legal será asignado a tu caso una vez que lo crees. Puedes comunicarte con él a través del foro o mediante mensajes privados en tu caso.'
    },
    'foro': {
      keywords: ['foro', 'comunidad', 'pregunta', 'ayuda'],
      response: 'El foro es un espacio donde puedes hacer preguntas públicas y recibir ayuda de otros usuarios y asesores. Es ideal para consultas generales y compartir experiencias.'
    },
    'perfil': {
      keywords: ['perfil', 'cuenta', 'datos', 'información personal'],
      response: 'Puedes actualizar tu información personal desde "Mi Perfil" en el menú superior. Allí puedes cambiar tu nombre, email, teléfono y dirección.'
    },
    'contacto': {
      keywords: ['contacto', 'soporte', 'ayuda', 'asistencia'],
      response: 'Puedes obtener ayuda de varias formas: 1) Usando el foro para preguntas públicas, 2) Contactando a tu asesor asignado, 3) Enviando un mensaje desde tu caso.'
    }
  },
  default: 'Lo siento, no estoy seguro de cómo ayudarte con eso. Puedes intentar reformular tu pregunta o usar el foro para obtener ayuda de otros usuarios y asesores.'
};

// Función para encontrar la mejor respuesta
function findResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();

  // Saludos
  if (message.match(/^(hola|buenos días|buenas tardes|buenas noches|hi|hello)/i)) {
    return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)];
  }

  // Despedidas
  if (message.match(/(adiós|hasta luego|gracias|chao|bye)/i)) {
    return knowledgeBase.farewells[Math.floor(Math.random() * knowledgeBase.farewells.length)];
  }

  // Buscar en la base de conocimiento
  for (const [key, data] of Object.entries(knowledgeBase.questions)) {
    if (data.keywords.some(keyword => message.includes(keyword))) {
      return data.response;
    }
  }

  // Respuesta por defecto
  return knowledgeBase.default;
}

// @route   POST /api/chatbot/message
// @desc    Send a message to the chatbot
// @access  PUBLIC - VULNERABLE (sin autenticación para pentesting)
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'El mensaje es requerido' });
    }

    // Simular un pequeño delay para hacerlo más realista
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = findResponse(message);

    res.json({
      success: true,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ message: 'Error en el chatbot' });
  }
});

module.exports = router;
