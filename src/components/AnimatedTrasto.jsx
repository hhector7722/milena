import React, { useState, useRef, useEffect } from 'react'

export const AnimatedTrasto = ({ className = "", showShadow = true }) => {
    const [isReversed, setIsReversed] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)

    // Handle normal video ending -> switch to reverse
    const handleNormalEnded = () => {
        if (videoReverseRef.current) {
            videoReverseRef.current.currentTime = 0
            // Play first, then swap visibility to ensure no black frame
            videoReverseRef.current.play().then(() => {
                setIsReversed(true)
            }).catch(() => {
                // Fallback if autoplay is blocked
                setIsReversed(true)
            })
        }
    }

    // Handle reverse video ending -> switch to normal
    const handleReverseEnded = () => {
        if (videoNormalRef.current) {
            videoNormalRef.current.currentTime = 0
            videoNormalRef.current.play().then(() => {
                setIsReversed(false)
            }).catch(() => {
                setIsReversed(false)
            })
        }
    }

    // Initial play
    useEffect(() => {
        if (videoNormalRef.current) {
            videoNormalRef.current.play().catch(() => { })
        }
    }, [])

    return (
        <div className={`relative select-none ${className}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

            {/* Enhanced Shadow base - Defines the "floor" */}
            {showShadow && (
                <div className="absolute inset-0 rounded-3xl shadow-[0_48px_100px_-12px_rgba(0,0,0,0.8)] z-0" />
            )}

            {/* Animation Wrapper */}
            <div className="absolute inset-0 z-20 animate-bounce-subtle">
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        WebkitMaskImage: showShadow
                            ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                            : 'radial-gradient(circle at center, black 65%, transparent 95%)',
                        maskImage: showShadow
                            ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                            : 'radial-gradient(circle at center, black 65%, transparent 95%)',
                    }}
                >
                    {/* Buffer Normal */}
                    <video
                        ref={videoNormalRef}
                        src="/trasto-video.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={handleNormalEnded}
                        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-300 scale-[1.02] ${!isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                    />
                    {/* Buffer Reverse */}
                    <video
                        ref={videoReverseRef}
                        src="/trasto-video-reverse.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={handleReverseEnded}
                        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-300 scale-[1.02] ${isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                    />
                </div>
            </div>
        </div>
    )
}
