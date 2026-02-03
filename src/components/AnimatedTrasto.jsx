import React, { useState, useEffect, useRef } from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    const [activeVideo, setActiveVideo] = useState('normal') // 'normal' or 'reverse'
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)
    const requestRef = useRef()

    const startNext = (mode) => {
        const next = mode === 'normal' ? videoReverseRef.current : videoNormalRef.current
        if (next) {
            next.currentTime = 0.05 // Skip potential black frame at start
            next.play().then(() => {
                setActiveVideo(mode === 'normal' ? 'reverse' : 'normal')
            }).catch(() => { })
        }
    }

    const checkTime = () => {
        const current = activeVideo === 'normal' ? videoNormalRef.current : videoReverseRef.current
        if (current && current.duration) {
            const timeLeft = current.duration - current.currentTime
            // Trigger 0.6s before end to match the 600ms transition
            if (timeLeft < 0.6) {
                startNext(activeVideo)
            }
        }
        requestRef.current = requestAnimationFrame(checkTime)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(checkTime)
        if (videoNormalRef.current) videoNormalRef.current.play().catch(() => { })
        return () => cancelAnimationFrame(requestRef.current)
    }, [activeVideo])

    return (
        <div className={`relative select-none ${className}`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-[600ms] ease-in-out ${activeVideo === 'normal' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
                <video
                    ref={videoReverseRef}
                    src="/trasto-video-reverse.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-[600ms] ease-in-out ${activeVideo === 'reverse' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
            </div>
        </div>
    )
}
