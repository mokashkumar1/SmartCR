export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const publishableKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !publishableKey) {
    return response.status(500).json({ error: 'Supabase configuration is missing' })
  }

  try {
    const databaseResponse = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/keep_alive`,
      {
        method: 'POST',
        headers: {
          apikey: publishableKey,
          'Content-Type': 'application/json',
        },
        body: '{}',
        signal: AbortSignal.timeout(15_000),
      },
    )

    if (!databaseResponse.ok) {
      console.error(`Supabase keep-alive failed with status ${databaseResponse.status}`)
      return response.status(502).json({ error: 'Database query failed' })
    }

    return response.status(204).end()
  } catch (error) {
    console.error('Supabase keep-alive request failed', error)
    return response.status(502).json({ error: 'Database query failed' })
  }
}
