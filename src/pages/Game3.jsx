import { useState, useEffect, useRef } from 'react'

export default function Game3() {
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [splashPhase, setSplashPhase] = useState(1) // 1: CHAPTER 3, 2: THE EVIL WALL, 3: TENNIS?
  const [victory, setVictory] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const [bossHealth, setBossHealth] = useState(100)
  const [playerLives, setPlayerLives] = useState(4)

  // Game state refs
  const playerRef = useRef({ x: 400, vx: 0, width: 60, height: 80 })
  const ballsRef = useRef([])
  const keysRef = useRef({})
  const animationRef = useRef(null)
  const ballIdRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const audienceRef = useRef([])
  const bossShootingRef = useRef(false)
  const bossHitRef = useRef(0)
  const bossHealthRef = useRef(100) // Ref for real-time HP in game loop
  const playerLivesRef = useRef(4) // Ref for real-time lives in game loop
  const playerHitRef = useRef(0) // Track when player hits ball for animation

  // Initialize audience
  useEffect(() => {
    if (audienceRef.current.length === 0) {
      const audience = []
      const W = typeof window !== 'undefined' ? window.innerWidth : 800
      const H = typeof window !== 'undefined' ? window.innerHeight : 600

      // Calculate how many rows we can fit from top to bottom
      const startY = 80
      const endY = H - 100
      const rowHeight = 35
      const numRows = Math.floor((endY - startY) / rowHeight)

      const standWidth = 200
      const peoplePerRow = 7
      const personSpacing = 28
      const totalPeopleWidth = (peoplePerRow - 1) * personSpacing
      const leftMargin = (standWidth - totalPeopleWidth) / 2

      // Left side audience (centered in stand)
      for (let row = 0; row < numRows; row++) {
        for (let i = 0; i < peoplePerRow; i++) {
          audience.push({
            x: leftMargin + i * personSpacing,
            y: startY + row * rowHeight,
            color: Math.random() > 0.5 ? '#4a90e2' : '#ffffff',
            bobSpeed: 0.5 + Math.random() * 1.5,
            bobOffset: Math.random() * Math.PI * 2,
            side: 'left'
          })
        }
      }

      // Right side audience (centered in stand)
      for (let row = 0; row < numRows; row++) {
        for (let i = 0; i < peoplePerRow; i++) {
          audience.push({
            x: W - standWidth + leftMargin + i * personSpacing,
            y: startY + row * rowHeight,
            color: Math.random() > 0.5 ? '#4a90e2' : '#ffffff',
            bobSpeed: 0.5 + Math.random() * 1.5,
            bobOffset: Math.random() * Math.PI * 2,
            side: 'right'
          })
        }
      }

      audienceRef.current = audience
    }
  }, [])

  const W = typeof window !== 'undefined' ? window.innerWidth : 800
  const H = typeof window !== 'undefined' ? window.innerHeight : 600

  // Constants
  const PLAYER_SPEED = 8  // Increased from 6
  const HIT_BALL_SPEED = 15  // Increased from 12
  const BOSS_Y = 100
  const BOSS_HEIGHT = 80  // Taller wall
  const PLAYER_Y = H - 150
  const SPAWN_INTERVAL = 2000

  // Court dimensions - narrower court
  const COURT_LEFT = W / 2 - 300  // Narrower court (600px wide instead of W-100)
  const COURT_RIGHT = W / 2 + 300
  const COURT_WIDTH = 600

  // Splash screen timer with phases
  useEffect(() => {
    // Phase 1: "CHAPTER 3" - show for 1.5 seconds
    const timer1 = setTimeout(() => {
      setSplashPhase(2)
    }, 1500)

    // Phase 2: "THE EVIL WALL" - show for 1.5 seconds (total 3s)
    const timer2 = setTimeout(() => {
      setSplashPhase(3)
    }, 3000)

    // Phase 3: "AND TENNIS?" - show for 1 second (total 4s)
    // Phase 4: Wait 1 more second before starting (total 5s)
    const timer3 = setTimeout(() => {
      setShowSplash(false)
      setGameStarted(true)
      // Initialize spawn timer to delay first ball by 1 second
      setTimeout(() => {
        lastSpawnRef.current = performance.now()
      }, 1000)
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  // Victory countdown
  useEffect(() => {
    if (victory && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (victory && countdown === 0) {
      window.location.href = '/supersecretpage400'
    }
  }, [victory, countdown])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true

      if (e.key === ' ' && gameStarted && !victory && !gameOver) {
        e.preventDefault()
        // Trigger hit animation whenever spacebar is pressed
        playerHitRef.current = Date.now()
        checkBallHit()
      }
    }
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStarted, victory, gameOver])

  const checkBallHit = () => {
    const player = playerRef.current
    const hitZone = { x: player.x, y: PLAYER_Y, width: player.width, height: 100 }

    ballsRef.current = ballsRef.current.map(ball => {
      if (!ball.hit && ball.y >= hitZone.y - 50 && ball.y <= hitZone.y + 50 &&
          ball.x >= hitZone.x - 30 && ball.x <= hitZone.x + hitZone.width + 30) {
        return { ...ball, hit: true, vy: -HIT_BALL_SPEED, vx: 0 }
      }
      return ball
    })
  }

  // Game loop
  useEffect(() => {
    if (!gameStarted || victory || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const gameLoop = (timestamp) => {
      const player = playerRef.current
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        player.vx = -PLAYER_SPEED
      } else if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        player.vx = PLAYER_SPEED
      } else {
        player.vx = 0
      }
      player.x += player.vx
      // Keep player within narrower court bounds
      player.x = Math.max(COURT_LEFT + 10, Math.min(COURT_RIGHT - player.width - 10, player.x))

      // Spawn balls (with 1 second delay handled by lastSpawnRef initialization)
      if (lastSpawnRef.current > 0 && timestamp - lastSpawnRef.current > SPAWN_INTERVAL) {
        lastSpawnRef.current = timestamp

        // Spawn from center of the wall (angry face position)
        const centerX = W / 2

        // Target a random position within the narrower court
        const minTargetX = COURT_LEFT + 50
        const maxTargetX = COURT_RIGHT - 50
        const targetX = Math.random() * (maxTargetX - minTargetX) + minTargetX

        // Calculate angle to reach target
        const dx = targetX - centerX
        const dy = PLAYER_Y - (BOSS_Y + 50)
        const angle = Math.atan2(dy, dx)

        // Randomize ball speed between 4.5 and 6.3
        const minSpeed = 4.5
        const maxSpeed = 6.3
        const currentBallSpeed = Math.random() * (maxSpeed - minSpeed) + minSpeed

        ballsRef.current.push({
          id: ballIdRef.current++,
          x: centerX,
          y: BOSS_Y + BOSS_HEIGHT / 2,
          vx: Math.cos(angle) * currentBallSpeed,
          vy: Math.sin(angle) * currentBallSpeed,
          hit: false,
          trail: []
        })

        // Boss shooting animation - mouth opens
        bossShootingRef.current = true
        setTimeout(() => {
          bossShootingRef.current = false
        }, 300)
      }

      ballsRef.current = ballsRef.current.filter(ball => {
        ball.x += ball.vx
        ball.y += ball.vy

        if (ball.hit) {
          ball.trail.push({ x: ball.x, y: ball.y })
          if (ball.trail.length > 10) ball.trail.shift()
        }

        // Check if hit ball reaches the boss wall (anywhere in the wall area)
        if (ball.hit && ball.y <= BOSS_Y + BOSS_HEIGHT) {
          // Boss hit animation - vibrate
          bossHitRef.current = timestamp

          // Update both state and ref
          const newHealth = Math.max(0, bossHealthRef.current - 6)
          bossHealthRef.current = newHealth

          setBossHealth(newHealth)

          if (newHealth === 0) {
            setVictory(true)
            // Don't increment attempts on victory - only on retry
          }

          return false // Remove the ball
        }

        if (!ball.hit && ball.y > H) {
          // Lose 1 life for each missed ball
          const newLives = playerLivesRef.current - 1
          playerLivesRef.current = newLives
          setPlayerLives(newLives)

          if (newLives <= 0) {
            setGameOver(true)
          }

          return false
        }

        return true
      })


      // Render
      // Background - orange/red-brown surroundings (like real tennis court)
      ctx.fillStyle = '#c85a3f'
      ctx.fillRect(0, 0, W, H)

      // Left stand structure - dark blue
      ctx.fillStyle = '#1a2a4a'
      ctx.fillRect(0, 60, 200, H - 140)
      ctx.strokeStyle = '#0f1a2e'
      ctx.lineWidth = 3
      ctx.strokeRect(0, 60, 200, H - 140)

      // Left stand rows (horizontal lines)
      ctx.strokeStyle = '#0f1a2e'
      ctx.lineWidth = 2
      for (let i = 1; i < 15; i++) {
        const y = 60 + (i * (H - 140) / 15)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(200, y)
        ctx.stroke()
      }

      // Right stand structure - dark blue
      ctx.fillStyle = '#1a2a4a'
      ctx.fillRect(W - 200, 60, 200, H - 140)
      ctx.strokeStyle = '#0f1a2e'
      ctx.lineWidth = 3
      ctx.strokeRect(W - 200, 60, 200, H - 140)

      // Right stand rows (horizontal lines)
      for (let i = 1; i < 15; i++) {
        const y = 60 + (i * (H - 140) / 15)
        ctx.beginPath()
        ctx.moveTo(W - 200, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Draw audience with bobbing heads
      const currentTime = timestamp / 1000
      audienceRef.current.forEach(person => {
        const bobAmount = Math.sin(currentTime * person.bobSpeed + person.bobOffset) * 3

        // Head
        ctx.fillStyle = '#ffdbac'
        ctx.beginPath()
        ctx.arc(person.x, person.y + bobAmount, 12, 0, Math.PI * 2)
        ctx.fill()

        // T-shirt
        ctx.fillStyle = person.color
        ctx.fillRect(person.x - 10, person.y + bobAmount + 10, 20, 15)

        // Simple face features
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(person.x - 4, person.y + bobAmount - 2, 1.5, 0, Math.PI * 2)
        ctx.arc(person.x + 4, person.y + bobAmount - 2, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Umpire chair/ladder on right side of court
      const umpireX = COURT_RIGHT + 50
      const umpireBaseY = H / 2 + 50
      const ladderTopY = umpireBaseY - 100

      // Ladder legs (silver/gray metal) - DRAW FIRST
      ctx.strokeStyle = '#a8a8a8'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(umpireX - 15, umpireBaseY)
      ctx.lineTo(umpireX - 10, ladderTopY)
      ctx.moveTo(umpireX + 15, umpireBaseY)
      ctx.lineTo(umpireX + 10, ladderTopY)
      ctx.stroke()

      // Ladder rungs
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        const rungY = umpireBaseY - 20 - (i * 20)
        ctx.beginPath()
        ctx.moveTo(umpireX - 10, rungY)
        ctx.lineTo(umpireX + 10, rungY)
        ctx.stroke()
      }

      // Umpire seat (on top of ladder) - DRAW SECOND
      const seatY = ladderTopY - 10
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(umpireX - 20, seatY, 40, 8)

      // Umpire (sitting on chair) - DRAW LAST, positioned ON TOP of seat
      const umpireBob = Math.sin(currentTime * 0.3) * 2

      // Umpire shirt (red) - starts ABOVE the seat
      ctx.fillStyle = '#dc143c'
      ctx.fillRect(umpireX - 12, seatY - 20 + umpireBob, 24, 20)

      // Umpire head - positioned above body
      ctx.fillStyle = '#ffdbac'
      ctx.beginPath()
      ctx.arc(umpireX, seatY - 33 + umpireBob, 14, 0, Math.PI * 2)
      ctx.fill()

      // Umpire eyes - LARGE and visible
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(umpireX - 5, seatY - 33 + umpireBob, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(umpireX + 5, seatY - 33 + umpireBob, 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Umpire cap (white baseball cap on top of head)
      ctx.fillStyle = '#ffffff'
      // Cap top
      ctx.beginPath()
      ctx.ellipse(umpireX, seatY - 41 + umpireBob, 12, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      // Cap brim
      ctx.fillRect(umpireX - 14, seatY - 39 + umpireBob, 28, 4)
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.strokeRect(umpireX - 14, seatY - 39 + umpireBob, 28, 4)

      // Tennis court - bright grass green surface (narrower court)
      const courtColor = '#2d8b3d' // Brighter tennis court grass green
      ctx.fillStyle = courtColor
      ctx.fillRect(COURT_LEFT, BOSS_Y + 50, COURT_WIDTH, H - BOSS_Y - 200)

      // Court outer boundary - white
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 4
      ctx.strokeRect(COURT_LEFT, BOSS_Y + 50, COURT_WIDTH, H - BOSS_Y - 200)

      // Tennis court lines
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 3

      // Doubles sidelines (inner vertical lines for singles court)
      const doublesMargin = COURT_WIDTH * 0.15
      const singlesLeft = COURT_LEFT + doublesMargin
      const singlesRight = COURT_RIGHT - doublesMargin

      ctx.beginPath()
      ctx.moveTo(singlesLeft, BOSS_Y + 50)
      ctx.lineTo(singlesLeft, H - 150)
      ctx.moveTo(singlesRight, BOSS_Y + 50)
      ctx.lineTo(singlesRight, H - 150)
      ctx.stroke()

      // Service line (horizontal line in the middle - at 50%, only between singles lines)
      const serviceLineY = BOSS_Y + 50 + (H - BOSS_Y - 200) * 0.50
      ctx.beginPath()
      ctx.moveTo(singlesLeft, serviceLineY)
      ctx.lineTo(singlesRight, serviceLineY)
      ctx.stroke()

      // Center service line (vertical line in the middle, only in service box area)
      const centerServiceX = W / 2
      ctx.beginPath()
      ctx.moveTo(centerServiceX, BOSS_Y + 50)
      ctx.lineTo(centerServiceX, serviceLineY)
      ctx.stroke()

      // Boss wall - brick texture (spans narrower court, taller)
      ctx.fillStyle = '#3d1a1a'
      ctx.fillRect(COURT_LEFT, BOSS_Y, COURT_WIDTH, BOSS_HEIGHT)

      // Draw brick pattern
      const brickWidth = 40
      const brickHeight = 20
      const numBrickRows = Math.floor(BOSS_HEIGHT / brickHeight)
      const numBricksPerRow = Math.floor(COURT_WIDTH / brickWidth)

      ctx.strokeStyle = '#1a0a0a'
      ctx.lineWidth = 2

      for (let row = 0; row < numBrickRows; row++) {
        const offsetX = (row % 2) * (brickWidth / 2) // Offset every other row
        for (let col = 0; col < numBricksPerRow + 1; col++) {
          const x = COURT_LEFT + col * brickWidth - offsetX
          const y = BOSS_Y + row * brickHeight

          // Draw brick outline
          ctx.strokeRect(x, y, brickWidth, brickHeight)

          // Add some variation to brick color
          const variation = Math.sin(col * 0.5 + row * 0.3) * 10
          ctx.fillStyle = `rgb(${61 + variation}, ${26 + variation}, ${26 + variation})`
          ctx.fillRect(x + 1, y + 1, brickWidth - 2, brickHeight - 2)
        }
      }

      // No wall border - removed for cleaner look

      // Boss health bar (on top of the wall)
      const healthBarWidth = COURT_WIDTH - 40
      const healthBarX = COURT_LEFT + 20
      const healthBarY = BOSS_Y - 25

      // Health bar background
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, 15)
      ctx.strokeStyle = '#8b0000'
      ctx.lineWidth = 2
      ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 15)

      // Health bar fill (red to yellow gradient based on health)
      const currentBossHealth = bossHealthRef.current
      const healthPercent = currentBossHealth / 100
      const currentHealthWidth = healthBarWidth * healthPercent

      const gradient = ctx.createLinearGradient(healthBarX, 0, healthBarX + healthBarWidth, 0)
      if (currentBossHealth > 60) {
        gradient.addColorStop(0, '#ff0000')
        gradient.addColorStop(1, '#ff4444')
      } else if (currentBossHealth > 30) {
        gradient.addColorStop(0, '#ff8800')
        gradient.addColorStop(1, '#ffaa00')
      } else {
        gradient.addColorStop(0, '#ffff00')
        gradient.addColorStop(1, '#ffaa00')
      }

      ctx.fillStyle = gradient
      ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, 15)

      // Health bar text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`EVIL WALL: ${currentBossHealth} HP`, healthBarX + healthBarWidth / 2, healthBarY + 11)

      // Boss face on the wall (centered vertically in the taller wall)
      const baseFaceX = W / 2
      const baseFaceY = BOSS_Y + BOSS_HEIGHT / 2

      // Check if boss was recently hit (vibrate for 200ms)
      const timeSinceHit = bossHitRef.current > 0 ? (timestamp - bossHitRef.current) : 999999
      const isVibrating = timeSinceHit < 200
      const vibrateX = isVibrating ? (Math.random() - 0.5) * 8 : 0
      const vibrateY = isVibrating ? (Math.random() - 0.5) * 8 : 0

      const faceX = baseFaceX + vibrateX
      const faceY = baseFaceY + vibrateY

      // Eyes
      const eyeY = faceY - 8
      const leftEyeX = faceX - 12
      const rightEyeX = faceX + 12

      if (isVibrating) {
        // Eyes open when hit - white circles with black pupils
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Pupils (black for contrast)
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Eyes closed normally (horizontal lines)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(leftEyeX - 6, eyeY)
        ctx.lineTo(leftEyeX + 6, eyeY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(rightEyeX - 6, eyeY)
        ctx.lineTo(rightEyeX + 6, eyeY)
        ctx.stroke()
      }

      // Mouth
      const mouthY = faceY + 12

      if (bossShootingRef.current) {
        // Mouth open (O shape) when shooting - white
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(faceX, mouthY, 10, 0, Math.PI * 2)
        ctx.fill()
        // Black inner circle for depth
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(faceX, mouthY, 6, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Evil smile (curved downward) - white
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(faceX, mouthY - 5, 15, 0.2 * Math.PI, 0.8 * Math.PI)
        ctx.stroke()
      }

      // Player - enhanced tennis player with hit animation
      const playerCenterX = player.x + player.width / 2
      const timeSincePlayerHit = Date.now() - playerHitRef.current
      const isHitting = timeSincePlayerHit < 200 // Hit pose lasts 200ms

      if (isHitting) {
        // HIT POSE - racket extended forward

        // Legs (wider stance)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(player.x + 15, PLAYER_Y + 60, 12, 22)
        ctx.fillRect(player.x + 35, PLAYER_Y + 60, 12, 22)

        // Body (leaning forward)
        ctx.fillStyle = '#4a90e2' // Blue tennis shirt
        ctx.fillRect(player.x + 18, PLAYER_Y + 25, 26, 38)

        // Arms - extended forward for hit
        ctx.strokeStyle = '#ffdbac'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        // Right arm extended
        ctx.beginPath()
        ctx.moveTo(playerCenterX + 10, PLAYER_Y + 30)
        ctx.lineTo(playerCenterX - 20, PLAYER_Y + 35)
        ctx.stroke()

        // Head
        ctx.fillStyle = '#ffdbac'
        ctx.beginPath()
        ctx.arc(playerCenterX, PLAYER_Y + 15, 13, 0, Math.PI * 2)
        ctx.fill()

        // Headband
        ctx.fillStyle = '#ff6347'
        ctx.fillRect(playerCenterX - 13, PLAYER_Y + 8, 26, 4)

        // Eyes (focused)
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(playerCenterX - 4, PLAYER_Y + 14, 2, 0, Math.PI * 2)
        ctx.arc(playerCenterX + 4, PLAYER_Y + 14, 2, 0, Math.PI * 2)
        ctx.fill()

        // Tennis racket - extended forward
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(playerCenterX - 20, PLAYER_Y + 35)
        ctx.lineTo(playerCenterX - 35, PLAYER_Y + 40)
        ctx.stroke()

        // Racket head (larger, more detailed)
        ctx.strokeStyle = '#ff6347'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(playerCenterX - 40, PLAYER_Y + 35, 12, 15, -0.3, 0, Math.PI * 2)
        ctx.stroke()

        // Racket strings
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 0.8
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.moveTo(playerCenterX - 48 + i * 4, PLAYER_Y + 25)
          ctx.lineTo(playerCenterX - 48 + i * 4, PLAYER_Y + 45)
          ctx.stroke()
        }
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(playerCenterX - 50, PLAYER_Y + 25 + i * 5)
          ctx.lineTo(playerCenterX - 30, PLAYER_Y + 25 + i * 5)
          ctx.stroke()
        }

      } else {
        // NORMAL POSE - ready stance

        // Legs (normal stance)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(player.x + 20, PLAYER_Y + 60, 10, 22)
        ctx.fillRect(player.x + 32, PLAYER_Y + 60, 10, 22)

        // Body
        ctx.fillStyle = '#4a90e2' // Blue tennis shirt
        ctx.fillRect(player.x + 18, PLAYER_Y + 25, 26, 38)

        // Shirt stripes
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(player.x + 18, PLAYER_Y + 30, 26, 2)
        ctx.fillRect(player.x + 18, PLAYER_Y + 36, 26, 2)

        // Arms - holding racket ready
        ctx.strokeStyle = '#ffdbac'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        // Left arm
        ctx.beginPath()
        ctx.moveTo(playerCenterX - 10, PLAYER_Y + 30)
        ctx.lineTo(playerCenterX - 15, PLAYER_Y + 45)
        ctx.stroke()
        // Right arm
        ctx.beginPath()
        ctx.moveTo(playerCenterX + 10, PLAYER_Y + 30)
        ctx.lineTo(playerCenterX + 5, PLAYER_Y + 45)
        ctx.stroke()

        // Head
        ctx.fillStyle = '#ffdbac'
        ctx.beginPath()
        ctx.arc(playerCenterX, PLAYER_Y + 15, 13, 0, Math.PI * 2)
        ctx.fill()

        // Headband
        ctx.fillStyle = '#ff6347'
        ctx.fillRect(playerCenterX - 13, PLAYER_Y + 8, 26, 4)

        // Eyes
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(playerCenterX - 4, PLAYER_Y + 14, 2, 0, Math.PI * 2)
        ctx.arc(playerCenterX + 4, PLAYER_Y + 14, 2, 0, Math.PI * 2)
        ctx.fill()

        // Smile
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(playerCenterX, PLAYER_Y + 17, 5, 0.2 * Math.PI, 0.8 * Math.PI)
        ctx.stroke()

        // Tennis racket - held at side
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(playerCenterX - 10, PLAYER_Y + 45)
        ctx.lineTo(playerCenterX - 18, PLAYER_Y + 30)
        ctx.stroke()

        // Racket head
        ctx.strokeStyle = '#ff6347'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(playerCenterX - 20, PLAYER_Y + 22, 10, 12, -0.2, 0, Math.PI * 2)
        ctx.stroke()

        // Racket strings
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 0.8
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(playerCenterX - 27 + i * 4, PLAYER_Y + 14)
          ctx.lineTo(playerCenterX - 27 + i * 4, PLAYER_Y + 30)
          ctx.stroke()
        }
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.moveTo(playerCenterX - 28, PLAYER_Y + 14 + i * 4)
          ctx.lineTo(playerCenterX - 12, PLAYER_Y + 14 + i * 4)
          ctx.stroke()
        }
      }

      // Tennis balls
      ballsRef.current.forEach(ball => {
        // Trail for hit balls
        if (ball.hit && ball.trail.length > 0) {
          ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(ball.trail[0].x, ball.trail[0].y)
          ball.trail.forEach(t => ctx.lineTo(t.x, t.y))
          ctx.stroke()
        }

        // Tennis ball - yellow/green with fuzzy texture
        const ballColor = ball.hit ? '#ffff00' : '#ccff00'

        // Ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(ball.x + 2, ball.y + 2, 10, 0, Math.PI * 2)
        ctx.fill()

        // Main ball
        ctx.fillStyle = ballColor
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2)
        ctx.fill()

        // Tennis ball curve line
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, 10, 0.3 * Math.PI, 1.7 * Math.PI, false)
        ctx.stroke()

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw player lives (hearts) on canvas - top center
      const heartSpacing = 32
      const totalHeartsWidth = 4 * heartSpacing
      const heartStartX = (W - totalHeartsWidth) / 2 + heartSpacing / 2
      const heartY = 50

      for (let i = 0; i < 4; i++) {
        const heartX = heartStartX + (i * heartSpacing)
        const isActive = i < playerLivesRef.current

        // Heart shape - draw two circles and a triangle
        ctx.fillStyle = isActive ? '#ffffff' : '#444444'

        // Left circle
        ctx.beginPath()
        ctx.arc(heartX - 4, heartY - 3, 4, 0, Math.PI * 2)
        ctx.fill()

        // Right circle
        ctx.beginPath()
        ctx.arc(heartX + 4, heartY - 3, 4, 0, Math.PI * 2)
        ctx.fill()

        // Bottom triangle
        ctx.beginPath()
        ctx.moveTo(heartX - 8, heartY - 3)
        ctx.lineTo(heartX, heartY + 7)
        ctx.lineTo(heartX + 8, heartY - 3)
        ctx.closePath()
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameStarted, victory, gameOver])

  if (showSplash) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          {splashPhase >= 1 && (
            <div className="text-5xl font-bold text-white mb-8">
              CHAPTER 3
            </div>
          )}

          {splashPhase >= 2 && (
            <div className="text-4xl font-bold text-white">
              {splashPhase >= 2 && "THE EVIL WALL"}
              {splashPhase >= 3 && " AND TENNIS?"}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (victory) {
    const carPosition = ((5 - countdown) / 5) * 100 // 0% to 100% as countdown goes 5 to 0

    return (
      <div className="w-screen h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-gray-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-0 w-full h-48 bg-gray-700" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            white 40px,
            white 60px
          )`,
          backgroundPosition: `${carPosition * 5}px center`,
          backgroundSize: '100px 4px',
          backgroundRepeat: 'repeat-x',
          backgroundPositionY: '50%'
        }}>
          {/* Road edges */}
          <div className="absolute top-0 w-full h-2 bg-yellow-400"></div>
          <div className="absolute bottom-0 w-full h-2 bg-yellow-400"></div>
        </div>

        {/* Car */}
        <div className="absolute" style={{
          bottom: '96px',
          left: `${carPosition}%`,
          transform: 'translateX(-50%)',
          transition: 'left 1s linear'
        }}>
          {/* Car body */}
          <div className="relative">
            {/* Main body */}
            <div className="w-32 h-16 bg-red-600 rounded-lg relative">
              {/* Roof */}
              <div className="absolute -top-8 left-6 w-20 h-10 bg-red-700 rounded-t-lg"></div>
              {/* Windows */}
              <div className="absolute -top-7 left-8 w-7 h-8 bg-blue-300 rounded"></div>
              <div className="absolute -top-7 left-17 w-7 h-8 bg-blue-300 rounded"></div>
              {/* Headlights */}
              <div className="absolute top-4 -right-1 w-2 h-3 bg-yellow-200 rounded"></div>
              <div className="absolute top-9 -right-1 w-2 h-3 bg-yellow-200 rounded"></div>
            </div>
            {/* Wheels */}
            <div className="absolute -bottom-3 left-4 w-8 h-8 bg-black rounded-full border-4 border-gray-400"></div>
            <div className="absolute -bottom-3 right-4 w-8 h-8 bg-black rounded-full border-4 border-gray-400"></div>
          </div>
        </div>

        {/* Text */}
        <div className="absolute top-32 text-center z-10">
          <div className="text-4xl font-bold text-white mb-8">
            TIME TO RELOCATE YOU TO OUR CITY
          </div>
          <div className="text-7xl font-bold text-yellow-300">
            {countdown}
          </div>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{
        backgroundColor: '#8b4513',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            rgba(0,0,0,0.2) 20px,
            rgba(0,0,0,0.2) 22px
          ),
          repeating-linear-gradient(
            90deg,
            #8b4513,
            #8b4513 60px,
            #a0522d 60px,
            #a0522d 120px,
            #7a3f0f 120px,
            #7a3f0f 180px
          )
        `
      }}>
        <div className="text-center">
          <div className="text-5xl font-bold mb-6 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            THE EVIL WALL HAS TAKEN OVER
          </div>
          <button
            onClick={() => {
              // Increment game3 attempts
              const attempts = parseInt(localStorage.getItem('game3_attempts') || '1') + 1
              localStorage.setItem('game3_attempts', attempts.toString())
              // Restart the game
              window.location.reload()
            }}
            className="px-8 py-4 bg-gray-800 text-white font-bold text-xl rounded hover:bg-gray-700 transition-colors"
          >
            RESTART
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Boss Health Bar */}
      <div className="absolute top-4 left-4 w-64">
        <div className="text-white text-sm mb-1">EVIL WALL</div>
        <div className="w-full h-8 bg-gray-800 border-2 border-red-500 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
            style={{ width: `${bossHealth}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {bossHealth} HP
            </span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0" />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
        <div>Arrow Keys / A/D to move • Spacebar to hit balls</div>
        <div className="text-xs text-gray-400 mt-1">Miss 3 balls = lose 1 heart</div>
      </div>
    </div>
  )
}
