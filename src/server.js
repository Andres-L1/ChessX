require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { nanoid } = require('nanoid');
const Stripe = require('stripe');

const {
  createLock,
  getLockByToken,
  getLockBySessionId,
  updateLock
} = require('./db');
const { formatAmount, safeUrl } = require('./utils');

const app = express();

const PORT = process.env.PORT || 3000;
const DEFAULT_CURRENCY = (process.env.DEFAULT_CURRENCY || 'eur').toLowerCase();
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 2
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    return res.status(400).send('Stripe webhook not configured.');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const token = session.metadata && session.metadata.token;
    const lock = token ? await getLockByToken(token) : await getLockBySessionId(session.id);

    if (lock && session.payment_status === 'paid') {
      await updateLock(lock.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe: {
          ...(lock.stripe || {}),
          session_id: session.id,
          payment_intent: session.payment_intent,
          customer_email: session.customer_details ? session.customer_details.email : null
        }
      });
    }
  }

  res.json({ received: true });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

app.use((req, res, next) => {
  res.locals.baseUrl = BASE_URL;
  res.locals.formatAmount = formatAmount;
  res.locals.defaultCurrency = DEFAULT_CURRENCY;
  next();
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'ChessX'
  });
});

app.get('/create', (req, res) => {
  res.render('create', {
    title: 'Crear candado'
  });
});

app.post('/api/locks', upload.single('file'), async (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const priceRaw = (req.body.price || '').trim();
    const currency = (req.body.currency || DEFAULT_CURRENCY).toLowerCase();
    const clientEmail = (req.body.client_email || '').trim();
    const deliveryType = (req.body.delivery_type || 'upload').trim();
    const linkUrl = safeUrl(req.body.link_url || '');

    if (!title) {
      return res.status(400).render('error', {
        title: 'Faltan datos',
        message: 'Necesitas un titulo para el candado.'
      });
    }

    const price = Number.parseFloat(priceRaw.replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).render('error', {
        title: 'Precio invalido',
        message: 'El precio debe ser un numero mayor que cero.'
      });
    }

    const amountCents = Math.round(price * 100);

    let filePayload = null;
    if (deliveryType === 'upload') {
      if (!req.file) {
        return res.status(400).render('error', {
          title: 'Falta el archivo',
          message: 'Sube un archivo final para bloquearlo.'
        });
      }
      filePayload = {
        type: 'upload',
        path: req.file.path,
        original_name: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size
      };
    } else {
      if (!linkUrl) {
        return res.status(400).render('error', {
          title: 'Link invalido',
          message: 'Introduce un link valido a Drive, Figma o similar.'
        });
      }
      filePayload = {
        type: 'link',
        url: linkUrl
      };
    }

    const lock = {
      id: `lock_${nanoid(10)}`,
      token: nanoid(20),
      title,
      description,
      amount_cents: amountCents,
      currency,
      status: 'locked',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_email: clientEmail || null,
      file: filePayload,
      stripe: {}
    };

    await createLock(lock);

    res.redirect(`/created/${lock.token}`);
  } catch (error) {
    res.status(500).render('error', {
      title: 'Algo fallo',
      message: 'No pudimos crear el candado. Intenta de nuevo.'
    });
  }
});

app.get('/created/:token', async (req, res) => {
  const lock = await getLockByToken(req.params.token);
  if (!lock) {
    return res.status(404).render('error', {
      title: 'Candado no encontrado',
      message: 'El enlace no existe o ya expiro.'
    });
  }

  res.render('created', {
    title: 'Candado creado',
    lock
  });
});

app.get('/lock/:token', async (req, res) => {
  const lock = await getLockByToken(req.params.token);
  if (!lock) {
    return res.status(404).render('error', {
      title: 'No existe',
      message: 'Este candado no esta disponible.'
    });
  }

  res.render('lock', {
    title: lock.status === 'paid' ? 'Archivo desbloqueado' : 'Archivo bloqueado',
    lock,
    stripeReady: Boolean(stripeSecretKey)
  });
});

app.post('/api/checkout/:token', async (req, res) => {
  const lock = await getLockByToken(req.params.token);
  if (!lock) {
    return res.status(404).render('error', {
      title: 'No existe',
      message: 'Este candado no esta disponible.'
    });
  }

  if (lock.status === 'paid') {
    return res.redirect(`/lock/${lock.token}`);
  }

  if (!stripe) {
    return res.status(500).render('error', {
      title: 'Stripe no configurado',
      message: 'Configura STRIPE_SECRET_KEY para cobrar.'
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price: process.env.STRIPE_PRICE_ID ? process.env.STRIPE_PRICE_ID : undefined,
          price_data: !process.env.STRIPE_PRICE_ID ? {
            currency: lock.currency,
            unit_amount: lock.amount_cents,
            product_data: {
              name: lock.title,
              description: lock.description || 'Entrega final'
            }
          } : undefined
        }
      ],
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/lock/${lock.token}`,
      customer_email: lock.client_email || undefined,
      metadata: {
        lock_id: lock.id,
        token: lock.token
      }
    });

    await updateLock(lock.id, {
      stripe: {
        ...(lock.stripe || {}),
        session_id: session.id
      }
    });

    return res.redirect(303, session.url);
  } catch (error) {
    return res.status(500).render('error', {
      title: 'Pago no disponible',
      message: 'No pudimos iniciar el pago. Intenta mas tarde.'
    });
  }
});

app.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.redirect('/');
  }

  let lock = await getLockBySessionId(sessionId);
  let session = null;

  if (stripe) {
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      const token = session.metadata && session.metadata.token;
      if (token) {
        lock = await getLockByToken(token);
      }

      if (lock && session.payment_status === 'paid' && lock.status !== 'paid') {
        await updateLock(lock.id, {
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe: {
            ...(lock.stripe || {}),
            session_id: session.id,
            payment_intent: session.payment_intent,
            customer_email: session.customer_details ? session.customer_details.email : null
          }
        });
      }
    } catch (error) {
      // ignore
    }
  }

  if (!lock) {
    return res.status(404).render('error', {
      title: 'Pago recibido',
      message: 'No encontramos el candado asociado.'
    });
  }

  res.render('success', {
    title: 'Pago confirmado',
    lock,
    session
  });
});

app.get('/download/:token', async (req, res) => {
  const lock = await getLockByToken(req.params.token);
  if (!lock) {
    return res.status(404).render('error', {
      title: 'No existe',
      message: 'Este candado no esta disponible.'
    });
  }

  if (lock.status !== 'paid') {
    return res.status(403).render('error', {
      title: 'Bloqueado',
      message: 'Debes completar el pago para desbloquear el archivo.'
    });
  }

  if (lock.file.type === 'link') {
    return res.redirect(lock.file.url);
  }

  if (!fs.existsSync(lock.file.path)) {
    return res.status(404).render('error', {
      title: 'Archivo no disponible',
      message: 'El archivo ya no esta en el servidor.'
    });
  }

  return res.download(lock.file.path, lock.file.original_name);
});

app.use((req, res) => {
  res.status(404).render('error', {
    title: '404',
    message: 'No encontramos esta pagina.'
  });
});

app.listen(PORT, () => {
  console.log(`ChessX listening on ${PORT}`);
});
