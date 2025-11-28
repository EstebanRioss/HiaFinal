import { NextResponse } from 'next/server';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export async function GET() {
    try {
        const metrics = await register.metrics();
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': register.contentType,
            },
        });
    } catch (error) {
        return new NextResponse('Error generating metrics', { status: 500 });
    }
}