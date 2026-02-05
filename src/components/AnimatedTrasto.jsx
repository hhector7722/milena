import React from 'react'

export const AnimatedTrasto = ({ className = "", showShadow = true }) => {
    return (
        <div className={`relative select-none ${className}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

            {showShadow && (
                <div className="absolute inset-0 rounded-3xl shadow-[0_48px_100px_-12px_rgba(0,0,0,0.8)] z-0" />
            )}

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
                        src="/trasto-boomerang.mp4"
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-screen scale-[1.02]"
                    />
                </div>
            </div>
        </div>
    )
}