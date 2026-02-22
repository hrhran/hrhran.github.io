import { useState, useEffect, useRef } from 'react'

export default function Game2() {
  const [showElevator, setShowElevator] = useState(true)
  const [lightsOn, setLightsOn] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [fallingNotes, setFallingNotes] = useState([])
  const [hitEffects, setHitEffects] = useState([]) // For hit animations
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds countdown
  const [gameOver, setGameOver] = useState(false)
  const [finalRank, setFinalRank] = useState('')
  const noteIdRef = useRef(0)
  const hitEffectIdRef = useRef(0)
  const gameAreaRef = useRef(null)
  const audioRef = useRef(null)

  // Elevator transition
  useEffect(() => {
    const elevatorTimer = setTimeout(() => {
      setShowElevator(false)
      // Turn on lights after 2 seconds
      setTimeout(() => {
        setLightsOn(true)
        // Start game after lights on
        setTimeout(() => {
          setGameStarted(true)
        }, 2000)
      }, 2000)
    }, 3000) // Elevator animation duration
    return () => clearTimeout(elevatorTimer)
  }, [])

  // Audio control - start when game starts, stop when game ends
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Small delay to ensure audio element is ready
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0 // Reset to beginning
          audioRef.current.play().catch((err) => {
            console.log('Audio autoplay prevented:', err)
          })
        }
      }
      // Use a small timeout to ensure DOM is ready
      const timer = setTimeout(playAudio, 100)
      return () => clearTimeout(timer)
    } else if (gameOver && audioRef.current) {
      // Stop audio when game ends
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [gameStarted, gameOver])

  // Spawn falling notes - completely random
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnRandomNote = () => {
      const lanes = ['left', 'down', 'up', 'right']
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)]
      const newNote = {
        id: noteIdRef.current++,
        lane: randomLane,
        y: 0, // start from top
        speed: 0.8, // speed per frame
      }
      setFallingNotes((prev) => [...prev, newNote])

      // Schedule next spawn with random delay (300-800ms)
      const nextDelay = Math.random() * 500 + 300
      timeoutId = setTimeout(spawnRandomNote, nextDelay)
    }

    let timeoutId = setTimeout(spawnRandomNote, 500) // Start after 500ms

    return () => clearTimeout(timeoutId)
  }, [gameStarted, gameOver])

  // Countdown timer
  useEffect(() => {
    if (!gameStarted || gameOver) return
    if (timeLeft <= 0) {
      setGameOver(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Calculate rank when timer hits 0
          setScore((currentScore) => {
            let rank = 'D'
            if (currentScore >= 9500) rank = 'S'
            else if (currentScore >= 8000) rank = 'A'
            else if (currentScore >= 6500) rank = 'B'
            else if (currentScore >= 5000) rank = 'C'
            setFinalRank(rank)

            // Save stats to localStorage
            const attempts = parseInt(localStorage.getItem('game2_attempts') || '0') + 1
            localStorage.setItem('game2_attempts', attempts.toString())

            const bestScore = parseInt(localStorage.getItem('game2_best_score') || '0')
            if (currentScore > bestScore) {
              localStorage.setItem('game2_best_score', currentScore.toString())
            }

            const bestRank = localStorage.getItem('game2_best_rank') || 'D'
            const rankOrder = { S: 5, A: 4, B: 3, C: 2, D: 1 }
            if (rankOrder[rank] > rankOrder[bestRank]) {
              localStorage.setItem('game2_best_rank', rank)
            }

            return currentScore
          })
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameStarted, gameOver, timeLeft])

  // Update falling notes
  useEffect(() => {
    if (!gameStarted || gameOver) return
    let animationFrameId
    const animate = () => {
      setFallingNotes((prev) => {
        const updated = prev.map((note) => ({
          ...note,
          y: note.y + note.speed,
        }))
        // Remove notes that fell off screen
        return updated.filter((note) => note.y < 100)
      })
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [gameStarted, gameOver])

  // Handle key presses
  useEffect(() => {
    if (!gameStarted) return
    const handleKeyPress = (e) => {
      const keyMap = {
        ArrowLeft: 'left',
        ArrowDown: 'down',
        ArrowUp: 'up',
        ArrowRight: 'right',
      }
      const lane = keyMap[e.key]
      if (!lane) return

      // Check if any note is in the hit zone for this lane
      // Visual position: bottom 15% + 40px ≈ 80% from top
      const hitZoneY = 80 // percentage from top
      const hitTolerance = 8 // Generous tolerance

      setFallingNotes((prev) => {
        const hitNote = prev.find(
          (note) =>
            note.lane === lane &&
            note.y >= hitZoneY - hitTolerance &&
            note.y <= hitZoneY + hitTolerance
        )

        if (hitNote) {
          setScore((s) => s + 100)
          setCombo((c) => c + 1)

          // Create hit effect
          const hitEffect = {
            id: hitEffectIdRef.current++,
            lane: lane,
            y: hitNote.y,
          }
          setHitEffects((prev) => [...prev, hitEffect])

          // Remove hit effect after animation
          setTimeout(() => {
            setHitEffects((prev) => prev.filter((effect) => effect.id !== hitEffect.id))
          }, 500)

          return prev.filter((note) => note.id !== hitNote.id)
        } else {
          setCombo(0) // Reset combo on miss
          return prev
        }
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted])

  const getLanePosition = (lane) => {
    const positions = {
      left: '20%',
      down: '40%',
      up: '60%',
      right: '80%',
    }
    return positions[lane]
  }

  const getArrowSymbol = (lane) => {
    const arrows = {
      left: '←',
      down: '↓',
      up: '↑',
      right: '→',
    }
    return arrows[lane]
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden" style={{ backgroundColor: '#453f45' }}>
      {/* Elevator Transition */}
      {showElevator && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{
            background: 'linear-gradient(to bottom, #000000 0%, #453f45 100%)',
            animation: 'elevatorArrival 3s ease-out forwards',
          }}
        />
      )}

      {/* Main Game Area */}
      {!showElevator && (
        <div
          ref={gameAreaRef}
          className="relative w-full h-screen"
          style={{
            backgroundColor: lightsOn ? '#453f45' : '#000000',
          }}
        >
          {/* Drummer GIF - visible when lights on */}
          {lightsOn && (
            <div
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
              style={{
                width: '300px',
                height: '300px',
              }}
            >
              <img
                src="/assets/drummer.gif"
                alt="Drummer"
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          )}

          {/* Score, Timer, and Combo */}
          {gameStarted && !gameOver && (
            <>
              <div className="absolute top-4 left-4 text-white text-2xl font-bold">
                Score: {score}
              </div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-4xl font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="absolute top-4 right-4 text-yellow-400 text-2xl font-bold">
                Combo: {combo}x
              </div>
            </>
          )}

          {/* Game Area - Rhythm Game */}
          {gameStarted && !gameOver && (
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Lane markers */}
              <div className="absolute top-0 left-0 w-full h-full">
                {['left', 'down', 'up', 'right'].map((lane) => (
                  <div
                    key={lane}
                    className="absolute top-0 h-full"
                    style={{
                      left: getLanePosition(lane),
                      width: '80px',
                      transform: 'translateX(-50%)',
                      borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRight: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                ))}
              </div>

              {/* Hit zone indicator - background only, no borders */}
              <div
                className="absolute left-0 w-full"
                style={{
                  bottom: '15%',
                  height: '80px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              />

              {/* Arrow key indicators at hit zone */}
              {['left', 'down', 'up', 'right'].map((lane) => (
                <div
                  key={`indicator-${lane}`}
                  className="absolute text-6xl"
                  style={{
                    left: getLanePosition(lane),
                    bottom: 'calc(15% + 40px)', // Center in 80px box: 15% + half of 80px
                    transform: 'translate(-50%, 50%)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {getArrowSymbol(lane)}
                </div>
              ))}

              {/* Falling notes */}
              {fallingNotes.map((note) => (
                <div
                  key={note.id}
                  className="absolute text-5xl"
                  style={{
                    left: getLanePosition(note.lane),
                    top: `${note.y}%`,
                    transform: 'translateX(-50%)',
                    color: '#00ff00',
                    textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                  }}
                >
                  {getArrowSymbol(note.lane)}
                </div>
              ))}

              {/* Hit effects */}
              {hitEffects.map((effect) => (
                <div
                  key={effect.id}
                  className="absolute text-7xl"
                  style={{
                    left: getLanePosition(effect.lane),
                    top: `${effect.y}%`,
                    transform: 'translateX(-50%)',
                    color: '#ffff00',
                    textShadow: '0 0 30px rgba(255, 255, 0, 1)',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    animation: 'hitBurst 0.5s ease-out forwards',
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
              <div
                className="text-9xl font-bold mb-8"
                style={{
                  color: finalRank === 'S' ? '#FFD700' :
                         finalRank === 'A' ? '#C0C0C0' :
                         finalRank === 'B' ? '#CD7F32' :
                         finalRank === 'C' ? '#8B4513' : '#696969',
                  textShadow: `0 0 40px ${finalRank === 'S' ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)'}`,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                {finalRank}
              </div>
              <div className="text-4xl text-white mb-4">
                Final Score: {score}
              </div>
              <div className="text-2xl text-gray-400 mb-8">
                {finalRank === 'S' && 'PERFECT! You are a rhythm master!'}
                {finalRank === 'A' && 'Almost perfect! But not good enough!'}
                {finalRank === 'B' && 'Good job! but you can do better!'}
                {finalRank === 'C' && 'Not bad, but you can do better!'}
                {finalRank === 'D' && 'Thats just too bad'}
              </div>

              {finalRank === 'S' ? (
                <button
                  onClick={() => window.location.href = '/supersecretpage258'}
                  className="px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: '#d4af37',
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d4af37'
                    e.currentTarget.style.color = '#000'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.8)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a'
                    e.currentTarget.style.color = '#d4af37'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)'
                  }}
                >
                  PROCEED
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300"
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
              )}
            </div>
          )}
        </div>
      )}

      {/* Audio Player - Hidden */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onLoadedData={() => {
          console.log('Audio loaded and ready')
        }}
      >
        <source src="/assets/drums.mp3" type="audio/mpeg" />
        {/* <source src="/assets/music-track.ogg" type="audio/ogg" /> */}
        {/* Add your audio file to /public/assets/music-track.mp3 */}
      </audio>

      {/* CSS Animations */}
      <style>{`
        @keyframes elevatorArrival {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes hitBurst {
          0% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
