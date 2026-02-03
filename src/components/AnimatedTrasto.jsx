import React, { useState, useEffect, useRef } from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    const [activeVideo, setActiveVideo] = useState('normal') // 'normal' or 'reverse'
    const [isSwapping, setIsSwapping] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)
    const requestRef = useRef()

    const performSwap = (mode) => {
        if (isSwapping) return

        const next = mode === 'normal' ? videoReverseRef.current : videoNormalRef.current
        if (next) {
            setIsSwapping(true)
            next.currentTime = 0.12 // Skip the very first frame to ensure buffer
            next.play().then(() => {
                // Wait for the next video to actually have a frame (0.2s of play)
                const checkPlaying = () => {
                    if (next.currentTime > 0.25) {
                        setActiveVideo(mode === 'normal' ? 'reverse' : 'normal')
                        // Short guard time to prevent double-trigger
                        setTimeout(() => setIsSwapping(false), 100)
                    } else {
                        requestAnimationFrame(checkPlaying)
                    }
                }
                checkPlaying()
            }).catch(() => {
                setIsSwapping(false)
            })
        }
    }

    const monitorPlayback = () => {
        const current = activeVideo === 'normal' ? videoNormalRef.current : videoReverseRef.current
        if (current && current.duration && !isSwapping) {
            const timeLeft = current.duration - current.currentTime
            // Start the next video 0.8s before the current one ends
            if (timeLeft < 0.8) {
                performSwap(activeVideo)
            }
        }
        requestRef.current = requestAnimationFrame(monitorPlayback)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(monitorPlayback)
        if (videoNormalRef.current) videoNormalRef.current.play().catch(() => { })
        return () => cancelAnimationFrame(requestRef.current)
    }, [activeVideo, isSwapping])

    return (
        <div className={`relative select-none ${className}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))'
                }}
            >
                {/* Always behind safety frame */}
                <img src="/trasto.png" className="absolute inset-0 w-full h-full object-contain opacity-20" alt="" />

                <video
                    ref={videoNormalRef}
                    src="/trasto-video.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen ${activeVideo === 'normal' ? 'z-30 opacity-100' : 'z-10 opacity-0'}`}
                />
                <video
                    ref={videoReverseRef}
                    src="/trasto-video-reverse.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen ${activeVideo === 'reverse' ? 'z-30 opacity-100' : 'z-10 opacity-0'}`}
                />
            </div>
        </div>
    )
}
