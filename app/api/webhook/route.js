export const runtime = 'edge'

// Use a global variable that persists in Edge runtime
const globalForBots = globalThis;
if (!globalForBots.bots) {
  globalForBots.bots = new Map();
}
const bots = globalForBots.bots;

export async function POST(request) {
  const url = new URL(request.url);
  const botId = url.searchParams.get('id');
  
  const update = await request.json();
  const messageText = update.message?.text || '';
  const chatId = update.message?.chat?.id;
  
  const bot = bots.get(botId);
  
  if (!bot) {
    // Try to reply with error
    return new Response('Bot not found', { status: 200 });
  }
  
  // Find matching command
  const cmd = bot.commands.find(c => messageText.startsWith(c.name));
  
  let responseText = "❌ Unknown command. Try /start";
  
  if (cmd) {
    try {
      // Create ctx object
      const ctx = {
        message: update.message,
        reply: async (text) => {
          await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: text,
              parse_mode: 'HTML'
            })
          });
        }
      };
      
      // Execute user code
      const fn = new Function('ctx', `
        return (async () => {
          ${cmd.code}
        })();
      `);
      await fn(ctx);
      return new Response('OK', { status: 200 });
      
    } catch (e) {
      responseText = "❌ Error: " + e.message;
    }
  } else if (messageText === '/start') {
    responseText = "👋 Welcome! Bot is connected but no /start command set. Add it in dashboard.";
  }
  
  // Send response
  await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: responseText 
    })
  });
  
  return new Response('OK', { status: 200 });
}

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const commands = JSON.parse(url.searchParams.get('cmds') || '[]');
  const botId = Math.random().toString(36).substring(2, 15);
  
  bots.set(botId, { token, commands });
  
  return new Response(JSON.stringify({ botId }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
