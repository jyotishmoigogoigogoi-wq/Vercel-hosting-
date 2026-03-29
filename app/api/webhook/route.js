export const runtime = 'edge'

// Store bots in memory (resets on deploy, but works for testing)
const bots = new Map()

export async function POST(request) {
  const url = new URL(request.url)
  const botId = url.searchParams.get('id')
  
  const update = await request.json()
  const messageText = update.message?.text || ''
  const chatId = update.message?.chat?.id
  
  // Get bot data
  const bot = bots.get(botId)
  if (!bot) {
    return new Response('Bot not found', { status: 404 })
  }
  
  // Find command
  const cmd = bot.commands.find(c => messageText.startsWith(c.name))
  
  let responseText = "❌ Unknown command"
  
  if (cmd) {
    try {
      // Create ctx
      const ctx = {
        message: update.message,
        reply: async (text) => {
          await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text })
          })
        }
      }
      
      // Run user code
      const fn = new Function('ctx', cmd.code)
      await fn(ctx)
      return new Response('OK', { status: 200 })
    } catch (e) {
      responseText = "Error: " + e.message
    }
  } else if (messageText === '/start') {
    responseText = "👋 Welcome! Add commands in dashboard."
  }
  
  // Send error/unknown response
  await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: responseText })
  })
  
  return new Response('OK', { status: 200 })
}

// Save bot data via GET request (called from dashboard)
export async function GET(request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const commands = JSON.parse(url.searchParams.get('cmds') || '[]')
  const botId = Math.random().toString(36).substring(7)
  
  bots.set(botId, { token, commands })
  
  return new Response(JSON.stringify({ botId }), { status: 200 })
}
