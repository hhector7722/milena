import React, { useState, useEffect, useRef } from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    const [activeVideo, setActiveVideo] = useState('normal') // 'normal' or 'reverse'
    const [isTransitioning, setIsTransitioning] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)
    const requestRef = useRef()

    const startNext = (mode) => {
        if (isTransitioning) return

        const next = mode === 'normal' ? videoReverseRef.current : videoNormalRef.current
        if (next) {
            setIsTransitioning(true)
            next.currentTime = 0.1 // Skip start-to-end gaps
            next.play().then(() => {
                setActiveVideo(mode === 'normal' ? 'reverse' : 'normal')
                // Keep the blur/transition state for the duration of the CSS transition
                setTimeout(() => setIsTransitioning(false), 1000)
            }).catch(() => {
                setIsTransitioning(false)
            })
        }
    }

    const checkTime = () => {
        const current = activeVideo === 'normal' ? videoNormalRef.current : videoReverseRef.current
        if (current && current.duration && !isTransitioning) {
            const timeLeft = current.duration - current.currentTime
            // Trigger 1s before to allow for a smooth 1s cross-fade
            if (timeLeft < 1.0) {
                startNext(activeVideo)
            }
        }
        requestRef.current = requestAnimationFrame(checkTime)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(checkTime)
        if (videoNormalRef.current) videoNormalRef.current.play().catch(() => { })
        return () => cancelAnimationFrame(requestRef.current)
    }, [activeVideo, isTransitioning])

    return (
        <div className={`relative select-none transition-all duration-1000 ${className} ${isTransitioning ? 'blur-[3px] scale-[1.02]' : 'blur-0 scale-100'}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div
                className="absolute inset-0 z-20"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))'
                }}
            >
                <video
                    ref={videoNormalRef}
                    src="/trasto-video.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-all duration-1000 ease-in-out ${activeVideo === 'normal' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
                <video
                    ref={videoReverseRef}
                    src="/trasto-video-reverse.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-all duration-1000 ease-in-out ${activeVideo === 'reverse' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
            </div>
        </div>
    )
}
