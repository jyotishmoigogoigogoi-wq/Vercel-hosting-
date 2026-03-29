'use client'

import { useState } from 'react'

export default function Home() {
  const [token, setToken] = useState('')
  const [botInfo, setBotInfo] = useState(null)
  const [commands, setCommands] = useState([])
  const [deployed, setDeployed] = useState(false)

  const checkToken = async () => {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data = await res.json()
    if (data.ok) {
      setBotInfo(data.result)
    } else {
      alert('Invalid token!')
    }
  }

  const addCommand = () => {
    setCommands([...commands, { name: '', code: 'await ctx.reply("Hello!")' }])
  }

  const updateCommand = (index, field, value) => {
    const newCmds = [...commands]
    newCmds[index][field] = value
    setCommands(newCmds)
  }

  const deploy = async () => {
    // Save to server memory
    const res = await fetch(`/api/webhook?token=${token}&cmds=${encodeURIComponent(JSON.stringify(commands))}`)
    const data = await res.json()
    
    // Set webhook with botId
    const webhookUrl = `${window.location.origin}/api/webhook?id=${data.botId}`
    await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    })
    
    setDeployed(true)
    alert('Bot deployed! Bot ID: ' + data.botId)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ color: '#00ff88' }}>🤖 Yorichii Bots</h1>
      
      {/* Token Input */}
      <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>Step 1: Connect Bot</h3>
        <input
          type="password"
          placeholder="Paste bot token from @BotFather"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#222', border: 'none', color: '#fff' }}
        />
        <button onClick={checkToken} style={{ marginTop: '10px', padding: '10px 20px', background: '#00ff88', border: 'none', borderRadius: '5px' }}>
          Check Token
        </button>
        {botInfo && <p style={{ color: '#00ff88', marginTop: '10px' }}>✅ @{botInfo.username}</p>}
      </div>

      {/* Commands */}
      {botInfo && (
        <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h3>Step 2: Add Commands</h3>
          
          {commands.map((cmd, i) => (
            <div key={i} style={{ background: '#1a1a1a', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
              <input
                placeholder="/start"
                value={cmd.name}
                onChange={(e) => updateCommand(i, 'name', e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', background: '#222', border: 'none', color: '#fff' }}
              />
              <textarea
                placeholder='await ctx.reply("Hello!")'
                value={cmd.code}
                onChange={(e) => updateCommand(i, 'code', e.target.value)}
                style={{ width: '100%', height: '80px', padding: '8px', background: '#0d1117', border: 'none', color: '#c9d1d9', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          ))}
          
          <button onClick={addCommand} style={{ marginTop: '10px', padding: '8px 15px', background: '#444', color: '#fff', border: 'none', borderRadius: '5px' }}>
            + Add Command
          </button>
        </div>
      )}

      {/* Deploy */}
      {botInfo && commands.length > 0 && (
        <div style={{ background: '#111', padding: '15px', borderRadius: '8px' }}>
          <h3>Step 3: Deploy</h3>
          <button onClick={deploy} style={{ padding: '15px 30px', background: deployed ? '#00aa55' : '#00ff88', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            {deployed ? '🚀 Deployed!' : '🚀 Deploy Bot'}
          </button>
        </div>
      )}
    </div>
  )
}
