import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY

    console.log('Testing OpenRouter API...')
    console.log('API Key available:', !!apiKey)
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'MISSING')

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'API Key not configured',
        apiKeySet: false,
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Unfold Course Generator Test',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          {
            role: 'user',
            content: 'Say hello briefly in one sentence.',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    console.log('OpenRouter Response Status:', response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter Error:', data)
      return NextResponse.json({
        status: 'error',
        message: 'OpenRouter API failed',
        statusCode: response.status,
        error: data,
      })
    }

    console.log('OpenRouter Success:', data.choices?.[0]?.message?.content)

    return NextResponse.json({
      status: 'success',
      message: 'API is working',
      apiKeySet: true,
      response: data.choices?.[0]?.message?.content,
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error),
    })
  }
}
