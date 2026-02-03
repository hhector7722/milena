import React, { useState, useEffect, useRef } from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    const [isReversed, setIsReversed] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)

    // Handle seamless video switching
    useEffect(() => {
        if (isReversed) {
            if (videoReverseRef.current) {
                videoReverseRef.current.currentTime = 0
                videoReverseRef.current.play().catch(() => { })
            }
        } else {
            if (videoNormalRef.current) {
                videoNormalRef.current.currentTime = 0
                videoNormalRef.current.play().catch(() => { })
            }
        }
    }, [isReversed])

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
                    onEnded={() => setIsReversed(true)}
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${!isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
                <video
                    ref={videoReverseRef}
                    src="/trasto-video-reverse.mp4"
                    muted
                    playsInline
                    preload="auto"
                    onEnded={() => setIsReversed(false)}
                    className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                />
            </div>
        </div>
    )
}
