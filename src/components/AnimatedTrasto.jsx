import React, { useState, useRef, useEffect } from 'react'

export const AnimatedTrasto = ({ className = "", showShadow = true }) => {
    const [currentSrc, setCurrentSrc] = useState('/trasto-video.mp4')
    const videoRef = useRef(null)

    // Handle source swapping and playback
    const handleEnded = () => {
        const nextSrc = currentSrc === '/trasto-video.mp4'
            ? '/trasto-video-reverse.mp4'
            : '/trasto-video.mp4'
        setCurrentSrc(nextSrc)
    }

    // Effect to play video immediately when source changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => { })
        }
    }, [currentSrc])

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
                    <video
                        ref={videoRef}
                        src={currentSrc}
                        muted
                        playsInline
                        preload="auto"
                        onEnded={handleEnded}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
                    />
                </div>
            </div>
        </div>
    )
}
