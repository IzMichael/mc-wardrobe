import { json } from '@sveltejs/kit';

export function GET() {
    const data = {};
    return json(data);
};

export async function POST({ request }) {
    const {  } = await request.json();
    return json({});
};