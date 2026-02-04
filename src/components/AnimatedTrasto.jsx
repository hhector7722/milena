import React, { useState, useRef, useEffect } from 'react'

export const AnimatedTrasto = ({ className = "", showShadow = true }) => {
    const [isReversed, setIsReversed] = useState(false)
    const videoNormalRef = useRef(null)
    const videoReverseRef = useRef(null)

    // Ensure video starts playing on mount
    useEffect(() => {
        if (videoNormalRef.current) {
            videoNormalRef.current.play().catch(() => { })
        }
    }, [])

    return (
        <div className={`relative select-none ${className} ${!showShadow ? 'overflow-hidden' : ''}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

            {/* Enhanced Shadow base - Defines the "floor" */}
            {showShadow && (
                <div className="absolute inset-0 rounded-3xl shadow-[0_48px_100px_-12px_rgba(0,0,0,0.8)] z-0" />
            )}

            {/* Animation Wrapper */}
            <div className={`absolute inset-0 z-20 ${showShadow ? 'animate-bounce-subtle' : 'animate-bounce-subtle'}`}>
                <div
                    className={`absolute inset-0 ${showShadow ? 'translate-y-[12px] rounded-3xl overflow-hidden' : 'translate-y-[15px] sm:translate-y-[20px]'}`}
                    style={{
                        WebkitMaskImage: showShadow
                            ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                            : 'radial-gradient(circle at center, black 60%, transparent 95%)', // Expanded sharp area for ears
                        maskImage: showShadow
                            ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                            : 'radial-gradient(circle at center, black 60%, transparent 95%)',
                    }}
                >
                    {/* Double-buffered videos for flicker-free Boomerang loop */}
                    <video
                        ref={videoNormalRef}
                        src="/trasto-video.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={() => {
                            setIsReversed(true)
                            if (videoReverseRef.current) {
                                videoReverseRef.current.currentTime = 0
                                videoReverseRef.current.play().catch(() => { })
                            }
                        }}
                        className={`absolute inset-0 w-full h-h-full object-cover mix-blend-screen scale-[1.01] ${!isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                    />
                    <video
                        ref={videoReverseRef}
                        src="/trasto-video-reverse.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={() => {
                            setIsReversed(false)
                            if (videoNormalRef.current) {
                                videoNormalRef.current.currentTime = 0
                                videoNormalRef.current.play().catch(() => { })
                            }
                        }}
                        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen scale-[1.01] ${isReversed ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
                    />
                </div>
            </div>
        </div>
    )
}
