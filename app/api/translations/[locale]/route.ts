import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const translationsDir = path.join(process.cwd(), 'locales');

export async function GET(
	req: NextRequest,
	{ params }: { params: { locale: string } }
) {
	const { locale } = await params;
	const file = path.join(translationsDir, `${locale.toLowerCase()}.json`);
	try {
		const content = await fs.readFile(file, 'utf-8');
		return NextResponse.json(JSON.parse(content));
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { locale: string } }
) {
	const { locale } = await params;
	const file = path.join(translationsDir, `${locale.toLowerCase()}.json`);
	try {
		await fs.writeFile(file, JSON.stringify({}, null, 2), 'utf-8');
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json(
			{ error: 'Could not create' },
			{ status: 500 }
		);
	}
}
