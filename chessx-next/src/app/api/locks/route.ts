import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs-extra';
import { createLock } from '@/lib/db';
import { Lock } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const currency = (formData.get('currency') as string || 'eur').toLowerCase();
    const clientEmail = formData.get('client_email') as string;
    const deliveryType = formData.get('delivery_type') as string;
    const linkUrl = formData.get('link_url') as string;
    const file = formData.get('file') as File | null;

    if (!title) {
      return NextResponse.json({ message: 'El título es obligatorio' }, { status: 400 });
    }

    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ message: 'Precio inválido' }, { status: 400 });
    }

    const amountCents = Math.round(price * 100);

    let filePayload: Lock['file'];

    if (deliveryType === 'upload') {
      if (!file || file.size === 0) {
        return NextResponse.json({ message: 'Falta el archivo' }, { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), '..', 'uploads');
      await fs.ensureDir(uploadsDir);

      const filename = `${nanoid(10)}_${file.name.replace(/\s+/g, '_')}`;
      const filepath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      filePayload = {
        type: 'upload',
        path: filepath,
        original_name: file.name,
        mime: file.type,
        size: file.size
      };
    } else {
      if (!linkUrl) {
        return NextResponse.json({ message: 'Introduce un link válido' }, { status: 400 });
      }
      filePayload = {
        type: 'link',
        url: linkUrl
      };
    }

    const lock: Lock = {
      id: `lock_${nanoid(10)}`,
      token: nanoid(20),
      title,
      description: description || '',
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

    return NextResponse.json({ success: true, token: lock.token });
  } catch (error: any) {
    console.error('Error creating lock:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
