export async function GET() {
    const url = process.env.PICKEM_DATA

    if (!url) {
        throw new Error('Missing Competition Data URL')
    }

    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const data = await response.json()
    return Response.json(data)
}