import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Game1() {
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [showLore, setShowLore] = useState(false)
  const [loreText, setLoreText] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const [, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [gameOver, setGameOver] = useState(false)
  const [showBloodSplash, setShowBloodSplash] = useState(false)
  const [victory, setVictory] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [showElevator, setShowElevator] = useState(false)
  const [basketX, setBasketX] = useState(50) // percentage
  const [fallingItems, setFallingItems] = useState([])
  const [isFirstGame, setIsFirstGame] = useState(true)
  const gameAreaRef = useRef(null)
  const itemIdRef = useRef(0)
  const basketXRef = useRef(50) // ref to avoid re-render issues

  // Reset game state when entering fresh (not on Try Again)
  useEffect(() => {
    // Check if this is a fresh entry (not a retry)
    const isRetry = sessionStorage.getItem('game1_retry')
    if (!isRetry) {
      // Fresh entry - reset everything
      setShowSplash(true)
      setFadeOut(false)
      setShowLore(false)
      setLoreText('')
      setShowCountdown(false)
      setCountdownNumber(3)
      setGameStarted(false)
      setScore(0)
      setTimeLeft(45)
      setGameOver(false)
      setShowBloodSplash(false)
      setVictory(false)
      setCountdown(10)
      setShowElevator(false)
      setBasketX(50)
      setFallingItems([])
      setIsFirstGame(true)
    }
    // Clear retry flag after checking
    sessionStorage.removeItem('game1_retry')
  }, [])

  // Handle splash screen proceed button
  const handleProceed = () => {
    setFadeOut(true)
    setTimeout(() => {
      setShowSplash(false)
      if (isFirstGame) {
        setShowLore(true)
      } else {
        setShowCountdown(true)
      }
    }, 800)
  }

  // Lore text typing effect
  useEffect(() => {
    if (!showLore) return
    const fullText = "WE'RE SHORT ON STAFF. HELP US CATCH OUR CLIENTS..."
    let currentIndex = 0

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setLoreText(fullText.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setShowLore(false)
          setShowCountdown(true)
        }, 1000)
      }
    }, 50) // 50ms per character

    return () => clearInterval(typingInterval)
  }, [showLore])

  // Countdown 3, 2, 1, GO
  useEffect(() => {
    if (!showCountdown) return

    if (countdownNumber > 0) {
      const timer = setTimeout(() => {
        setCountdownNumber((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Show "GO" then start game
      setTimeout(() => {
        setShowCountdown(false)
        setGameStarted(true)
      }, 800)
    }
  }, [showCountdown, countdownNumber])

  // Game timer - state independent to avoid freezing
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Victory when time runs out without missing
          setVictory(true)
          // Save stats to localStorage
          const attempts = parseInt(localStorage.getItem('game1_attempts') || '0') + 1
          localStorage.setItem('game1_attempts', attempts.toString())
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver, victory])

  // Victory countdown
  useEffect(() => {
    if (!victory) return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setShowElevator(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [victory])

  // Navigate to Game2 after elevator animation
  useEffect(() => {
    if (showElevator) {
      const navTimer = setTimeout(() => {
        navigate('/supersecretpage113')
      }, 3000) // Wait for elevator animation to complete
      return () => clearTimeout(navTimer)
    }
  }, [showElevator, navigate])

  // Spawn falling items
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return
    const spawnInterval = setInterval(() => {
      const newItem = {
        id: itemIdRef.current++,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: 15, // start from bottom of sky
        speed: Math.random() * 0.4 + 0.5, // 0.5-0.9 pixels per frame (slower)
        flipped: Math.random() > 0.5, // randomly flip horizontally
      }
      setFallingItems((prev) => [...prev, newItem])
    }, 800) // spawn every 0.8 seconds (more eggs)
    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver, victory])

  // Update falling items using requestAnimationFrame
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return

    let animationFrameId
    const basketWidthPercent = 14.4 // 12 * 1.2 = 14.4
    const basketYPercent = 82

    const animate = () => {
      setFallingItems((prev) => {
        const updated = prev.map((item) => ({
          ...item,
          y: item.y + item.speed,
        }))

        // Check collision with basket - use ref to get current position without re-render
        const currentBasketX = basketXRef.current
        const caught = []
        const missed = []
        const remaining = updated.filter((item) => {
          if (item.y >= basketYPercent && item.y <= basketYPercent + 5) {
            // Check if item is within basket horizontal range
            if (
              item.x >= currentBasketX - basketWidthPercent / 2 &&
              item.x <= currentBasketX + basketWidthPercent / 2
            ) {
              caught.push(item.id)
              return false // remove caught item
            }
          }
          // Check if item fell past the basket (missed)
          if (item.y >= 85) {
            missed.push(item.id)
            return false // remove missed item
          }
          return true // keep falling
        })

        if (caught.length > 0) {
          setScore((s) => {
            const newScore = s + caught.length
            // Update best score in localStorage
            const bestScore = parseInt(localStorage.getItem('game1_best_score') || '0')
            if (newScore > bestScore) {
              localStorage.setItem('game1_best_score', newScore.toString())
            }
            return newScore
          })
        }

        if (missed.length > 0) {
          // Trigger blood splash and game over
          setShowBloodSplash(true)
          setTimeout(() => {
            setGameOver(true)
            // Save attempt on game over
            const attempts = parseInt(localStorage.getItem('game1_attempts') || '0') + 1
            localStorage.setItem('game1_attempts', attempts.toString())
          }, 800) // delay game over screen
        }

        return remaining
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [gameStarted, gameOver, victory])

  // Mouse movement for basket
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return
    const handleMouseMove = (e) => {
      if (!gameAreaRef.current) return
      const rect = gameAreaRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const clampedX = Math.max(6, Math.min(94, x)) // clamp between 6% and 94%
      basketXRef.current = clampedX // update ref immediately
      setBasketX(clampedX) // update state for rendering
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [gameStarted, gameOver, victory])

  return (
    <div className="relative min-h-screen w-screen bg-[#0b0b0b] overflow-hidden">
      {/* Mobile/Tablet Restriction Screen - Only show on screens smaller than 1024px */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white text-center px-8">
        <div className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          On a mobile? Really?
        </div>
        <div className="text-2xl md:text-3xl text-gray-400" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          C&apos;mon get a bigger screen
        </div>
      </div>

      {/* Game Content - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
      {/* CRS Splash Screen */}
      {showSplash && (
        <div
          className={
            `fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-gray-100 ` +
            `transition-opacity duration-700 ease-out ` +
            (fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100')
          }
          style={{ fontFamily: 'Georgia, "Times New Roman", Garamond, serif' }}
        >
          <div className="text-center">
            <div className="text-6xl md:text-8xl tracking-widest font-semibold">CRS</div>
            <div className="mt-2 text-gray-400 uppercase tracking-[0.3em] text-sm">
              Consumer Recreational Services
            </div>
          </div>
          <div className="absolute bottom-10 text-center text-gray-400">
            <p className="text-sm md:text-base mb-6">You have been invited by Hariharan to play</p>
            <button
              onClick={handleProceed}
              className="px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300"
              style={{
                backgroundColor: '#1a1a1a',
                color: '#d4af37',
                border: '2px solid #d4af37',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af37'
                e.currentTarget.style.color = '#000'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a'
                e.currentTarget.style.color = '#d4af37'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              PROCEED
            </button>
          </div>
        </div>
      )}

      {/* Game */}
      {!showSplash && (
        <div
          ref={gameAreaRef}
          className="relative w-full h-screen overflow-hidden"
          style={{ cursor: 'none' }}
        >
          {/* Game Background - Hidden when elevator shows */}
          {!showElevator && (
            <>
              {/* Dark Purple Sky - top 15% */}
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: '15%',
                  background: 'linear-gradient(to bottom, #1a0f2e, #2d1b4e)',
                }}
              />

          {/* Building Background */}
          <div
            className="absolute left-0 w-full"
            style={{
              top: '15%',
              height: '70%',
              backgroundImage: 'url(/assets/buildy.png)',
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'left top',
              imageRendering: 'pixelated',
            }}
          />

          {/* Yellow/Gold Dining Floor - bottom 15% */}
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: '15%',
              background: `
                linear-gradient(to bottom, #d4a574, #b8935e),
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 39px,
                  #8b6f47 39px,
                  #8b6f47 41px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  transparent 39px,
                  #8b6f47 39px,
                  #8b6f47 41px
                )
              `,
              backgroundBlendMode: 'multiply, normal, normal',
            }}
          >
            {/* Dining items in zig-zag pattern - fewer and larger */}
            <div className="relative w-full h-full">
              {[
                { x: 15, y: 65 },  // bottom
                { x: 30, y: 25 },  // top
                { x: 45, y: 65 },  // bottom
                { x: 70, y: 25 },  // top
                { x: 85, y: 65 },  // bottom
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: '80px',
                    height: '80px',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <img
                    src="/assets/dining.png"
                    alt="Dining item"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Timer Display - Top Center */}
          {gameStarted && !gameOver && !victory && (
            <div
              className="absolute top-8 left-1/2 transform -translate-x-1/2"
              style={{ zIndex: 1000 }}
            >
              <div
                className="px-8 py-4 rounded-lg shadow-2xl"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '3px solid #8b0000',
                  boxShadow: '0 0 30px rgba(139, 0, 0, 0.6), 0 4px 20px rgba(0, 0, 0, 0.8)',
                }}
              >
                <div className="text-center">
                  <div
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: '#999' }}
                  >
                    Time Remaining
                  </div>
                  <div
                    className="text-5xl font-bold tabular-nums"
                    style={{
                      color: timeLeft <= 10 ? '#ff0000' : '#ffffff',
                      textShadow: timeLeft <= 10 ? '0 0 10px #ff0000' : 'none',
                    }}
                  >
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Falling Items */}
          {fallingItems.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) scaleX(${item.flipped ? -1 : 1})`,
                pointerEvents: 'none',
                width: '60px',
                height: '60px',
              }}
            >
              <img
                src="/assets/falling-item.png"
                alt="Falling item"
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          ))}

          {/* Basket (dark cushion bed with gold borders) */}
          <div
            className="absolute"
            style={{
              left: `${basketX}%`,
              top: '82%',
              transform: 'translateX(-50%)',
              width: '144px', // 120px * 1.2 = 144px
              height: '40px',
              background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
              borderRadius: '12px',
              border: '4px solid #d4af37',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(212, 175, 55, 0.3)',
              pointerEvents: 'none',
            }}
          >
            {/* Inner cushion detail */}
            <div
              className="absolute inset-2"
              style={{
                background: 'linear-gradient(to bottom, #3a3a3a, #2a2a2a)',
                borderRadius: '6px',
                border: '1px solid #b8935e',
              }}
            />
          </div>
            </>
          )}

          {/* Lore Text Overlay */}
          {showLore && (
            <div
              className="absolute inset-0 flex items-start justify-center z-50"
              style={{
                paddingTop: '8%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                className="text-4xl font-bold text-center px-8"
                style={{
                  color: '#fff',
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: '0.05em',
                }}
              >
                {loreText}
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {showCountdown && (
            <div
              className="absolute inset-0 flex items-center justify-center z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                className="text-9xl font-bold"
                style={{
                  color: '#fff',
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  animation: 'pulse 0.5s ease-in-out',
                }}
              >
                {countdownNumber > 0 ? countdownNumber : 'GO!'}
              </div>
            </div>
          )}

          {/* Blood Splash Effect */}
          {showBloodSplash && (
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                animation: 'bloodSplash 0.8s ease-out forwards',
              }}
            >
              {/* Radial blood splash from center */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at center, rgba(139, 0, 0, 0.9) 0%, rgba(139, 0, 0, 0.7) 20%, rgba(80, 0, 0, 0.5) 40%, transparent 70%)',
                  opacity: 0,
                  animation: 'fadeInBlood 0.3s ease-out forwards',
                }}
              />
              {/* Dripping effect */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent 0px,
                      transparent 40px,
                      rgba(100, 0, 0, 0.6) 40px,
                      rgba(100, 0, 0, 0.6) 42px,
                      transparent 42px,
                      transparent 80px
                    )
                  `,
                  backgroundPosition: 'center top',
                  backgroundSize: '100% 200%',
                  opacity: 0,
                  animation: 'drip 0.8s ease-out 0.2s forwards',
                }}
              />
              {/* Placeholder for custom blood asset */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundImage: 'url(/blood-splash-asset.png)', // Placeholder for custom asset
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0,
                  animation: 'fadeInBlood 0.4s ease-out 0.1s forwards',
                }}
              />
            </div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <div
              className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-40"
              style={{ cursor: 'default' }}
            >
              <h1
                className="text-7xl font-bold mb-8"
                style={{
                  color: '#8b0000',
                  textShadow: '0 0 20px rgba(139, 0, 0, 0.8), 0 0 40px rgba(139, 0, 0, 0.5)',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: '0.1em',
                }}
              >
                GAME OVER
              </h1>
              <button
                onClick={() => {
                  // Set retry flag so we don't reset to splash screen
                  sessionStorage.setItem('game1_retry', 'true')
                  setIsFirstGame(false)
                  setGameOver(false)
                  setShowBloodSplash(false)
                  setVictory(false)
                  setGameStarted(false)
                  setScore(0)
                  setTimeLeft(45)
                  setFallingItems([])
                  setCountdownNumber(3)
                  setShowCountdown(true)
                }}
                className="mt-8 px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  border: '2px solid #8b0000',
                  boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b0000'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(139, 0, 0, 0.8)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 0, 0, 0.5)'
                }}
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {/* Victory Screen */}
          {victory && !showElevator && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40">
              <h1
                className="text-6xl font-bold mb-8"
                style={{
                  color: '#00ff00',
                  textShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                GOOD JOB
              </h1>

              {/* Blinking Eye */}
              <div
                className="my-8"
                style={{
                  fontSize: '120px',
                  animation: 'blink 3s infinite',
                }}
              >
                👁️
              </div>

              <p
                className="text-3xl mb-4"
                style={{
                  color: '#888',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: '0.05em',
                }}
              >
                WE&apos;LL BE WATCHING YOU
              </p>

              <div
                className="text-5xl font-bold mt-8"
                style={{
                  color: '#fff',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                }}
              >
                {countdown}
              </div>

              <p
                className="text-xl mt-4"
                style={{
                  color: '#666',
                }}
              >
                TAKING YOU TO THE BASEMENT...
              </p>
            </div>
          )}

          {/* Elevator Transition */}
          {showElevator && (
            <div
              className="absolute inset-0 bg-black flex items-center justify-center z-50"
              style={{
                animation: 'elevatorDown 3s ease-in forwards',
              }}
            >
              {/* Elevator going down effect */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 50%, #000000 100%)',
                  animation: 'elevatorMove 3s ease-in infinite',
                }}
              />

              {/* Face fades to black */}
              <div
                className="text-9xl"
                style={{
                  animation: 'fadeToBlack 2s ease-out forwards',
                }}
              >
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInBlood {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drip {
          from {
            opacity: 0;
            background-position: center -100%;
          }
          to {
            opacity: 0.8;
            background-position: center 100%;
          }
        }

        @keyframes bloodSplash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.9;
          }
        }

        @keyframes blink {
          0%, 45%, 55%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes elevatorDown {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes elevatorMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100px;
          }
        }

        @keyframes fadeToBlack {
          0% {
            opacity: 1;
            filter: brightness(1);
          }
          100% {
            opacity: 0;
            filter: brightness(0);
          }
        }
      `}</style>
      </div>
      {/* End of game content wrapper */}
    </div>
  )
}
