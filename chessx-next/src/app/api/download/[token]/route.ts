import { NextRequest, NextResponse } from 'next/server';
import { getLockByToken } from '@/lib/db';
import fs from 'fs-extra';
import { headers } from 'next/headers';

export async function GET(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const lock = await getLockByToken(token);

  if (!lock) {
    return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  }

  if (lock.status !== 'paid') {
    return NextResponse.json({ message: 'Acceso denegado. Pago pendiente.' }, { status: 403 });
  }

  if (lock.file.type !== 'upload') {
    return NextResponse.json({ message: 'Este candado no contiene un archivo descargable.' }, { status: 400 });
  }

  if (!(await fs.pathExists(lock.file.path))) {
    return NextResponse.json({ message: 'El archivo ya no está disponible en el servidor.' }, { status: 404 });
  }

  const fileBuffer = await fs.readFile(lock.file.path);
  
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': lock.file.mime || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${lock.file.original_name}"`,
    },
  });
}
