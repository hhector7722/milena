import React, { useState, useEffect, useRef } from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    const [showReverse, setShowReverse] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)

    const startTransition = (toReverse) => {
        if (toReverse) {
            if (videoReverseRef.current && !showReverse) {
                videoReverseRef.current.currentTime = 0
                videoReverseRef.current.play().then(() => {
                    setShowReverse(true)
                }).catch(() => { })
            }
        } else {
            if (videoNormalRef.current && showReverse) {
                videoNormalRef.current.currentTime = 0
                videoNormalRef.current.play().then(() => {
                    setShowReverse(false)
                }).catch(() => { })
            }
        }
    }

    const handleTimeUpdate = (e) => {
        const video = e.target
        const timeLeft = video.duration - video.currentTime
        // Switch when there's 0.4s left for a perfect cross-fade
        if (timeLeft < 0.4) {
            startTransition(!showReverse)
        }
    }

    // Auto-play on mount
    useEffect(() => {
        if (videoNormalRef.current) {
            videoNormalRef.current.play().catch(() => { })
        }
    }, [])

    return (
        <div className={`relative select-none ${className}`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            {/* Trasto - Foreground Level with horizontal blending only */}
            <div
                className="absolute inset-0 z-20"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskComposite: 'source-in',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskComposite: 'intersect',
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))'
                }}
            >
                <video
                    ref={videoNormalRef}
                    src="/trasto-video.mp4"
                    muted
                    playsInline
                    preload="auto"
                    onTimeUpdate={!showReverse ? handleTimeUpdate : undefined}
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-500 ease-in-out ${!showReverse ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
                <video
                    ref={videoReverseRef}
                    src="/trasto-video-reverse.mp4"
                    muted
                    playsInline
                    preload="auto"
                    onTimeUpdate={showReverse ? handleTimeUpdate : undefined}
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-500 ease-in-out ${showReverse ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
            </div>
        </div>
    )
}
