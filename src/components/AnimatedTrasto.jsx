```
import React from 'react'

export const AnimatedTrasto = ({ className = "" }) => {
    return (
        <div className={`relative select - none ${ className } `} 
             style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div
                className="absolute inset-0 z-20"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))'
                }}
            >
                {/* Single native looping video */}
                <video
                    src="/trasto-video.mp4"
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-contain mix-blend-screen"
                />
            </div>
        </div>
    )
}
```
