const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.json({ status: 'Backend MetaFlujo activo ✅', timestamp: Date.now() });
});

// POST /contact
app.post('/contact', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    await supabase
      .from('RegistroMetaflujo')
      .insert([{ name: nombre, email, propuesta: mensaje }]);

    await resend.emails.send({
      from: `MetaFlujo <contacto@${process.env.RESEND_DOMAIN}>`,
      to: [process.env.ADMIN_EMAIL],
      subject: '📩 Nuevo mensaje de contacto MetaFlujo',
      html: `
        <h3>Nuevo contacto recibido</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br>${mensaje}</p>
      `,
    });

    await resend.emails.send({
      from: `MetaFlujo <contacto@${process.env.RESEND_DOMAIN}>`,
      to: [email],
      subject: 'Gracias por contactarnos | MetaFlujo',
      html: `
        <p>Hola ${nombre},</p>
        <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos muy pronto.</p>
        <p>Equipo MetaFlujo 🚀</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend MetaFlujo escuchando en puerto ${PORT}`);
});
