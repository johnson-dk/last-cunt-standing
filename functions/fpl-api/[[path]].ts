export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  const url = new URL(context.request.url)
  const targetPath = url.pathname.replace(/^\/fpl-api/, '')
  const fplUrl = `https://fantasy.premierleague.com/api${targetPath}${url.search}`

  try {
    const response = await fetch(fplUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      cf: {
        cacheTtl: 300,
        cacheEverything: true,
      },
    })

    const body = await response.arrayBuffer()

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy FPL API request', details: String(err) }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
}

