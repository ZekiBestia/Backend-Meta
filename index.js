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
         <div style="background-color:#000000; color:#ffffff; font-family:'Segoe UI', sans-serif; padding:40px 20px; text-align:center;">
  <!-- Logo -->
  <img src="https://kubsycsxqsuoevqckjkm.supabase.co/storage/v1/object/public/PCP//logo.png" alt="MetaFlujo Logo" width="120" style="margin-bottom: 30px;" />

  <!-- Encabezado -->
  <h1 style="font-size:28px; background: linear-gradient(to right, #0ea5e9, #a855f7, #ec4899); -webkit-background-clip: text; color:transparent; margin-bottom: 10px;">
    ¡Gracias por tu propuesta!
  </h1>

  <p style="font-size:16px; line-height:1.6; max-width:600px; margin: 0 auto 30px;">
    Hemos recibido tu mensaje correctamente y uno de nuestros especialistas se pondrá en contacto contigo muy pronto para agendar una cita personalizada.
    <br/><br/>
    Mientras tanto, puedes conocer más sobre nuestros servicios de automatización estratégica visitando nuestro sitio web.
  </p>

  <!-- Botón -->
  <a href="https://metaflujo.mx" target="_blank" style="display:inline-block; margin-top: 20px; padding:12px 28px; background-color:#a855f7; color:white; font-weight:bold; border-radius:8px; text-decoration:none;">
    Visitar Metaflujo.mx
  </a>
 <!-- Firma de fundadores y contacto -->
<div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #333;">
  <div style="display: flex; justify-content: center; gap: 80px; flex-wrap: wrap; text-align: center;">
    <!-- Eliel -->
    <div>
      <p style="font-size: 16px; font-weight: bold; color: white;">Eliel Niel Olivera Reyes</p>
      <p style="font-size: 14px; color: #aaa; margin-top: -4px;">Co-Fundador y Creador del concepto MetaFlujo</p>
    </div>
    <!-- Ezequiel -->
    <div>
      <p style="font-size: 16px; font-weight: bold; color: white;">Ezequiel Olivera Reyes</p>
      <p style="font-size: 14px; color: #aaa; margin-top: -4px;">Co-Fundador · Visionario en IA y Automatización</p>
    </div>
  </div>

  <!-- Contacto central -->
  <div style="margin-top: 30px; text-align: center;">
    <p style="font-size: 14px; color: #ccc;">
      📞 +52 229 530 2806 · ✉ contacto@metaflujo.mx
    </p>

    <!-- Redes sociales -->
    <div style="margin-top: 10px;">
      <a href="https://wa.me/522295302806" target="_blank" style="margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="26" alt="WhatsApp" />
      </a>
      <a href="https://instagram.com/metaflujo" target="_blank" style="margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="26" alt="Instagram" />
      </a>
    </div>
  </div>
</div>

  <p style="font-size:12px; color:#777; margin-top:30px;">
   © 2025 METAFLUJO. Todos los derechos reservados.
  </p>
</div>
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
