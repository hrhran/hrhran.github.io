import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Game4() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [victory, setVictory] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [showBootScreen, setShowBootScreen] = useState(false)
  const [bootProgress, setBootProgress] = useState(0)
  const [bootMessage, setBootMessage] = useState('Initializing system...')

  // Game state in refs for performance
  const playerRef = useRef({ x: 100, y: 400, vx: 0, vy: 0, w: 30, h: 50, onGround: false, right: true })
  const keysRef = useRef({})
  const animationRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0 })

  // Constants
  const GRAVITY = 0.4
  const JUMP = -12
  const SPEED = 4
  const W = typeof window !== 'undefined' ? window.innerWidth : 800
  const H = typeof window !== 'undefined' ? window.innerHeight : 600

  // Platforms - longer level with challenging middle section, tall stairs at 90%
  const plats = [
    // Section 1: Easy start - wide platforms
    { x: 0, y: H - 80, w: 500, h: 40 },
    { x: 600, y: H - 80, w: 300, h: 40 },
    { x: 1000, y: H - 80, w: 300, h: 40 },
    { x: 1400, y: H - 120, w: 250, h: 40 },
    { x: 1750, y: H - 80, w: 300, h: 40 },

    // Section 2: Getting harder - smaller platforms
    { x: 2150, y: H - 120, w: 180, h: 40 },
    { x: 2430, y: H - 80, w: 200, h: 40 },
    { x: 2730, y: H - 150, w: 150, h: 40 },
    { x: 2980, y: H - 100, w: 180, h: 40 },
    { x: 3260, y: H - 80, w: 200, h: 40 },

    // Section 3: CHALLENGING - small platforms with precise jumps
    { x: 3560, y: H - 140, w: 120, h: 40 },
    { x: 3780, y: H - 200, w: 100, h: 40 },
    { x: 3980, y: H - 160, w: 90, h: 40 },
    { x: 4170, y: H - 120, w: 100, h: 40 },
    { x: 4370, y: H - 180, w: 80, h: 40 },
    { x: 4550, y: H - 140, w: 90, h: 40 },
    { x: 4740, y: H - 100, w: 100, h: 40 },
    { x: 4940, y: H - 160, w: 80, h: 40 },
    { x: 5120, y: H - 120, w: 90, h: 40 },
    { x: 5310, y: H - 80, w: 100, h: 40 },

    // Section 4: Recovery zone - wider platforms before stairs
    { x: 5510, y: H - 80, w: 250, h: 40 },
    { x: 5860, y: H - 100, w: 200, h: 40 },
    { x: 6160, y: H - 80, w: 300, h: 40 },
    { x: 6560, y: H - 80, w: 350, h: 40 },

    // Section 5: More challenging jumps
    { x: 7010, y: H - 120, w: 140, h: 40 },
    { x: 7250, y: H - 180, w: 110, h: 40 },
    { x: 7460, y: H - 140, w: 120, h: 40 },
    { x: 7680, y: H - 100, w: 150, h: 40 },
    { x: 7930, y: H - 160, w: 100, h: 40 },
    { x: 8130, y: H - 120, w: 130, h: 40 },
    { x: 8360, y: H - 80, w: 200, h: 40 },

    // Section 6: Final stretch before stairs
    { x: 8660, y: H - 100, w: 180, h: 40 },
    { x: 8940, y: H - 80, w: 250, h: 40 },
    { x: 9290, y: H - 80, w: 300, h: 40 },

    // Section 7: THE TALL STAIRS (elevator out of order joke) - at 90% mark
    { x: 9700, y: H - 120, w: 100, h: 40 },
    { x: 9800, y: H - 200, w: 100, h: 40 },
    { x: 9900, y: H - 280, w: 100, h: 40 },
    { x: 10000, y: H - 360, w: 100, h: 40 },
    { x: 10100, y: H - 440, w: 100, h: 40 },
    { x: 10200, y: H - 520, w: 100, h: 40 },
    { x: 10300, y: H - 600, w: 100, h: 40 },
    { x: 10400, y: H - 680, w: 100, h: 40 },
    { x: 10500, y: H - 760, w: 100, h: 40 },
    { x: 10600, y: H - 840, w: 100, h: 40 },
    { x: 10700, y: H - 920, w: 100, h: 40 },
    { x: 10800, y: H - 1000, w: 100, h: 40 },

    // Goal - CRS HQ entrance
    { x: 10900, y: H - 1000, w: 400, h: 40 },
  ]

  const GOAL = 11100
  const LVL_W = 11500

  // Title fadeout
  useEffect(() => {
    const t = setTimeout(() => setShowTitle(false), 3000)
    return () => clearTimeout(t)
  }, [])

  // Boot screen with detailed messages
  useEffect(() => {
    if (showBootScreen) {
      const messages = [
        { at: 0, text: 'Initializing CRS Employee Portal...' },
        { at: 8, text: 'Loading system drivers...' },
        { at: 15, text: 'Connecting to corporate network...' },
        { at: 25, text: 'Authenticating employee credentials...' },
        { at: 35, text: 'Accessing CRS database...' },
        { at: 45, text: 'Retrieving employee records...' },
        { at: 55, text: 'Loading HR management system...' },
        { at: 65, text: 'Synchronizing with headquarters...' },
        { at: 75, text: 'Initializing email client...' },
        { at: 85, text: 'Finalizing setup...' },
        { at: 95, text: 'Welcome to CRS!' },
      ]

      const i = setInterval(() => {
        setBootProgress((p) => {
          // Update message based on progress
          const currentMsg = messages.filter(m => m.at <= p).pop()
          if (currentMsg) {
            setBootMessage(currentMsg.text)
          }

          if (p >= 100) {
            clearInterval(i)
            setTimeout(() => {
              // Just navigate to mail - no copying or resetting needed
              navigate('/supersecretmail400')
            }, 500)
            return 100
          }
          return p + 1.5
        })
      }, 50)
      return () => clearInterval(i)
    }
  }, [showBootScreen, navigate])

  // Keys
  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key] = true
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') e.preventDefault()
    }
    const up = (e) => { keysRef.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (victory) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const p = playerRef.current
      const cam = cameraRef.current

      // Input
      if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
        p.vx = -SPEED
        p.right = false
      } else if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
        p.vx = SPEED
        p.right = true
      } else {
        p.vx = 0
      }

      // Jump
      if ((keysRef.current[' '] || keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) && p.onGround) {
        p.vy = JUMP
        p.onGround = false
      }

      // Physics
      p.vy += GRAVITY
      if (p.vy > 15) p.vy = 15
      p.x += p.vx
      p.y += p.vy

      // Collision
      p.onGround = false
      plats.forEach(pl => {
        if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h && p.vy >= 0) {
          p.y = pl.y - p.h
          p.vy = 0
          p.onGround = true
        }
      })

      // Bounds
      if (p.x < 0) p.x = 0
      if (p.x > LVL_W - p.w) p.x = LVL_W - p.w
      if (p.y > H + 100) {
        // Player fell - increment attempts
        const attempts = parseInt(localStorage.getItem('game4_attempts') || '1') + 1
        localStorage.setItem('game4_attempts', attempts.toString())
        // Respawn at start
        p.x = 100; p.y = 400; p.vx = 0; p.vy = 0
      }

      // Camera
      cam.x = p.x - W / 2
      if (cam.x < 0) cam.x = 0
      if (cam.x > LVL_W - W) cam.x = LVL_W - W
      cam.y = p.y - H / 2
      if (cam.y < -1200) cam.y = -1200
      if (cam.y > 0) cam.y = 0

      // Victory
      if (p.x >= GOAL && !victory) {
        setVictory(true)
        setShowBootScreen(true)
      }

      // Render
      ctx.fillStyle = '#0a0515'
      ctx.fillRect(0, 0, W, H)

      // Platforms
      plats.forEach(pl => {
        ctx.fillStyle = '#2d1b4e'
        ctx.fillRect(pl.x - cam.x, pl.y - cam.y, pl.w, pl.h)
        ctx.strokeStyle = '#8b6f47'
        ctx.lineWidth = 2
        ctx.strokeRect(pl.x - cam.x, pl.y - cam.y, pl.w, pl.h)
      })

      // Player (simple stick figure)
      const px = p.x - cam.x
      const py = p.y - cam.y
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      // Head
      ctx.arc(px + p.w / 2, py + 10, 8, 0, Math.PI * 2)
      ctx.stroke()
      // Body
      ctx.beginPath()
      ctx.moveTo(px + p.w / 2, py + 18)
      ctx.lineTo(px + p.w / 2, py + 35)
      ctx.stroke()
      // Arms
      ctx.beginPath()
      ctx.moveTo(px + p.w / 2 - 10, py + 25)
      ctx.lineTo(px + p.w / 2 + 10, py + 25)
      ctx.stroke()
      // Legs
      ctx.beginPath()
      ctx.moveTo(px + p.w / 2, py + 35)
      ctx.lineTo(px + p.w / 2 - 8, py + p.h)
      ctx.moveTo(px + p.w / 2, py + 35)
      ctx.lineTo(px + p.w / 2 + 8, py + p.h)
      ctx.stroke()

      // Sign at stairs
      if (cam.x > 9000 && cam.x < 10200) {
        ctx.fillStyle = '#d4af37'
        ctx.font = '20px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText('⚠️ ELEVATOR OUT OF ORDER ⚠️', 9650 - cam.x, H - 200 - cam.y)
        ctx.font = '14px Georgia'
        ctx.fillStyle = '#888'
        ctx.fillText('Please use the stairs', 9650 - cam.x, H - 175 - cam.y)
      }

      // Building
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(11100 - cam.x, H - 1200 - cam.y, 300, 200)
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 4
      ctx.strokeRect(11100 - cam.x, H - 1200 - cam.y, 300, 200)
      ctx.fillStyle = '#d4af37'
      ctx.font = 'bold 48px Georgia'
      ctx.textAlign = 'center'
      ctx.fillText('CRS', 11250 - cam.x, H - 1100 - cam.y)
      ctx.font = '16px Georgia'
      ctx.fillStyle = '#999'
      ctx.fillText('HEADQUARTERS', 11250 - cam.x, H - 1060 - cam.y)

      // Progress bar
      const prog = Math.min((p.x / GOAL) * 100, 100)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(W / 2 - 150, 20, 300, 30)
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(W / 2 - 148, 22, (prog / 100) * 296, 26)
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 2
      ctx.strokeRect(W / 2 - 150, 20, 300, 30)
      ctx.fillStyle = '#fff'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.floor(prog)}%`, W / 2, 40)

      animationRef.current = requestAnimationFrame(loop)
    }

    animationRef.current = requestAnimationFrame(loop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [victory])

  if (showBootScreen) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{ backgroundColor: '#5DADE2' }}>
        <div className="w-full max-w-3xl px-8">
          {/* Retro Terminal Header */}
          <div className="text-center mb-8">
            <div className="text-white text-5xl mb-4 font-mono font-bold tracking-wider" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}>
              CRS EMPLOYEE PORTAL
            </div>
            <div className="text-white text-lg font-mono opacity-90">SYSTEM INITIALIZATION</div>
          </div>

          {/* Terminal Window */}
          <div className="bg-white border-4 border-white shadow-2xl p-8 font-mono">
            {/* Boot Messages */}
            <div className="text-black text-sm space-y-2 mb-6">
              <div className="flex items-start">
                <span className="mr-2">{'>'}</span>
                <span>{bootMessage}</span>
              </div>
              <div className="ml-4 text-xs space-y-1 mt-4">
                {bootProgress > 5 && <div>[ OK ] System BIOS loaded</div>}
                {bootProgress > 15 && <div>[ OK ] Network adapter initialized</div>}
                {bootProgress > 25 && <div>[ OK ] Employee ID verified: EMP-{Math.floor(Math.random() * 9000 + 1000)}</div>}
                {bootProgress > 35 && <div>[ OK ] Database connection established</div>}
                {bootProgress > 45 && <div>[ OK ] Security protocols active</div>}
                {bootProgress > 55 && <div>[ OK ] HR system online</div>}
                {bootProgress > 65 && <div>[ OK ] Headquarters sync complete</div>}
                {bootProgress > 75 && <div>[ OK ] Email client ready</div>}
                {bootProgress > 85 && <div>[ OK ] User profile loaded</div>}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full h-8 bg-gray-300 border-2 border-black relative">
                <div
                  className="h-full transition-all duration-100"
                  style={{
                    width: `${bootProgress}%`,
                    backgroundColor: '#2E86C1'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono font-bold text-sm">
                    {Math.floor(bootProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="text-black text-xs text-center space-y-1 border-t-2 border-black pt-4">
              <div>CRS Employee Portal v2.1.4</div>
              <div>Copyright © 1995 Consumer Recreational Services</div>
              <div className="mt-2 opacity-70">Please wait while the system prepares your workspace...</div>
            </div>
          </div>

          {/* Blinking Cursor Effect */}
          <div className="text-white text-center mt-6 font-mono text-sm">
            <span className="animate-pulse">█</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {showTitle && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center" style={{ opacity: showTitle ? 1 : 0, transition: 'opacity 1s' }}>
            <div className="text-5xl font-bold mb-2 text-[#d4af37]" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(212, 175, 55, 0.8)' }}>
              REACH THE OFFICE
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
        Arrow Keys / WASD to move • Space / W to jump
      </div>
    </div>
  )
}
