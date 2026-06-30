import { motion, useScroll, useTransform, MotionValue, useSpring } from "motion/react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import confetti from "canvas-confetti";

// Define an array of cute cat colors/patterns
const catColors = [
  '#FFB74D', // Orange
  '#424242', // Black/Tuxedo
  '#9E9E9E', // Darker Gray
  '#FFFFFF', // White
  '#FFCC80', // Peach/Cream
  '#795548', // Brown
];

const CatSticker = React.memo(({ color }: { color: string }) => {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
       {/* Cheap drop shadow using an offset group - much faster than CSS filter */}
       <g fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.1)" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" transform="translate(0, 6)">
          <circle cx="60" cy="60" r="45" />
          <path d="M 28 45 L 18 15 L 45 28 Z" />
          <path d="M 92 45 L 102 15 L 75 28 Z" />
       </g>

       {/* Sticker Outline (Thick White Stroke) */}
       <g fill="white" stroke="white" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="60" cy="60" r="45" />
          <path d="M 28 45 L 18 15 L 45 28 Z" />
          <path d="M 92 45 L 102 15 L 75 28 Z" />
       </g>

       {/* Actual Cat shape inner */}
       <g>
          {/* Ears */}
          <path d="M 28 45 L 18 15 L 45 28 Z" fill={color} />
          <path d="M 92 45 L 102 15 L 75 28 Z" fill={color} />
          
          {/* Inner ears (pink) */}
          <path d="M 28 42 L 23 22 L 40 31 Z" fill="#F48FB1" />
          <path d="M 92 42 L 97 22 L 80 31 Z" fill="#F48FB1" />

          {/* Body/Head base */}
          <circle cx="60" cy="60" r="45" fill={color} />
          
          {/* Body patches for specific colored cats */}
          {color === '#424242' && ( // Tuxedo belly patch
             <path d="M 40 100 Q 60 65 80 100 A 45 45 0 0 1 40 100 Z" fill="white" />
          )}
          {color === '#FFB74D' && ( // Orange tabby stripes
             <>
               <path d="M 42 22 Q 45 35 38 45" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
               <path d="M 60 15 L 60 38" stroke="#E65100" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
               <path d="M 78 22 Q 75 35 82 45" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
             </>
          )}

          {/* Eyes */}
          <circle cx="46" cy="56" r="4.5" fill="#212121" />
          <circle cx="74" cy="56" r="4.5" fill="#212121" />
          
          {/* Cheek blush */}
          <ellipse cx="32" cy="62" rx="5" ry="3" fill="#FF8A80" opacity="0.7"/>
          <ellipse cx="88" cy="62" rx="5" ry="3" fill="#FF8A80" opacity="0.7"/>

          {/* Nose */}
          <polygon points="57.5,65 62.5,65 60,68" fill="#F48FB1" />
          
          {/* Mouth */}
          <path d="M 55 69 Q 57.5 73 60 69 Q 62.5 73 65 69" stroke="#424242" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Whiskers */}
          {/* Left side */}
          <line x1="18" y1="55" x2="33" y2="58" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <line x1="15" y1="62" x2="33" y2="62" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <line x1="18" y1="69" x2="33" y2="66" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          
          {/* Right side */}
          <line x1="102" y1="55" x2="87" y2="58" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <line x1="105" y1="62" x2="87" y2="62" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <line x1="102" y1="69" x2="87" y2="66" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
       </g>
    </svg>
  );
});

// A component that loops cats horizontally across the screen
const MarqueeCats = () => {
  // Generate a random sequence of cats
  const cats = useMemo(() => {
     let c = [];
     for(let i=0; i<25; i++) {
        c.push({
           color: catColors[Math.floor(Math.random() * catColors.length)],
           scale: 0.8 + Math.random() * 0.4,
           rotation: (Math.random() - 0.5) * 40
        });
     }
     return c;
  }, []);

  return (
    <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap h-40 flex items-center">
       <motion.div 
         animate={{ x: ["0%", "-50%"] }} 
         transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
         className="flex items-center"
         style={{ width: '200%' }} // Two identical segments to loop seamlessly
       >
          {/* Duplicate the array twice to ensure seamless looping */}
          {[...cats, ...cats].map((cat, i) => (
             <div key={i} className="inline-block px-10" style={{ transform: `scale(${cat.scale}) rotate(${cat.rotation}deg)` }}>
                <CatSticker color={cat.color} />
             </div>
          ))}
       </motion.div>
    </div>
  )
}

const CatScatterItem = ({ cat, scrollYProgress, introPhase }: { key?: React.Key, cat: any, scrollYProgress: MotionValue<number>, introPhase: string }) => {
  // calculate scattering destination randomly outward
  const scatterDist = useMemo(() => 800 + Math.random() * 800, []);
  const angle = useMemo(() => Math.atan2(cat.endY, cat.endX), [cat.endY, cat.endX]);
  
  const scatterX = cat.endX + Math.cos(angle) * scatterDist;
  const scatterY = cat.endY + Math.sin(angle) * scatterDist;

  // mapping scroll from 0 to 1 (when user scrolls from 1st section)
  const scrollOffsetX = useTransform(scrollYProgress, [0, 1], [0, scatterX - cat.endX]);
  const scrollOffsetY = useTransform(scrollYProgress, [0, 1], [0, scatterY - cat.endY]);
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, (Math.random() - 0.5) * 360]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const gatherVariants = {
    gathering: { x: cat.endX, y: cat.endY, rotate: cat.rotationEnd, scale: cat.scale, opacity: 1 },
    disappearing: { x: cat.endX + Math.cos(angle) * 150, y: cat.endY + Math.sin(angle) * 150, rotate: cat.rotationEnd + (Math.random() - 0.5) * 90, scale: 0, opacity: 0 },
    text: { x: cat.endX, y: cat.endY, scale: 0, opacity: 0 },
    scrolling: { x: cat.endX, y: cat.endY, scale: 0, opacity: 0 },
  };

  return (
    <motion.div
      style={{
         x: scrollOffsetX,
         y: scrollOffsetY,
         rotate: scrollRotate,
         opacity: scrollOpacity,
         zIndex: cat.id,
         willChange: 'transform'
      }}
      className="absolute pointer-events-none"
    >
      <motion.div
         initial={{ x: cat.startX, y: cat.startY, rotate: cat.rotationStart, scale: 0.1, opacity: 0 }}
         animate={introPhase}
         variants={gatherVariants}
         transition={{
             duration: introPhase === 'gathering' ? cat.duration : 0.8,
             delay: introPhase === 'gathering' ? cat.delay : Math.random() * 0.2,
             ease: introPhase === 'gathering' ? [0.34, 1.56, 0.64, 1] : "backIn",
         }}
      >
        {/* Offset negatively by 50% so the center of the sticker is directly at (0,0) */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
           <CatSticker color={cat.color} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Doodles = {
  Star: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 50 10 L 61 38 L 90 41 L 68 59 L 75 88 L 50 72 L 25 88 L 32 59 L 10 41 L 39 38 Z" />
    </svg>
  ),
  Heart: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 50 30 C 50 30 40 10 25 15 C 10 20 10 45 25 60 L 50 85 L 75 60 C 90 45 90 20 75 15 C 60 10 50 30 50 30 Z" />
    </svg>
  ),
  Sparkle: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 50 10 Q 50 50 10 50 Q 50 50 50 90 Q 50 50 90 50 Q 50 50 50 10 Z" />
    </svg>
  ),
  Ghost: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 25 80 L 25 40 C 25 15 75 15 75 40 L 75 80 L 65 70 L 55 80 L 45 70 L 35 80 L 25 70 Z" />
      <circle cx="40" cy="40" r="3" fill="currentColor" />
      <circle cx="60" cy="40" r="3" fill="currentColor" />
    </svg>
  ),
  Cat: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 20 50 L 20 20 L 40 30 L 60 30 L 80 20 L 80 50 C 80 80 20 80 20 50 Z" />
      <circle cx="35" cy="45" r="3" fill="currentColor" />
      <circle cx="65" cy="45" r="3" fill="currentColor" />
      <path d="M 45 55 L 50 60 L 55 55" />
      <path d="M 10 45 L 25 50 M 10 55 L 25 55 M 90 45 L 75 50 M 90 55 L 75 55" />
    </svg>
  )
};

const dates = ["27 June", "28 June", "29 June", "30 June", "1 July"];

const DateCard = ({ date, index, scrollYProgress }: { key?: React.Key, date: string, index: number, scrollYProgress: MotionValue<number> }) => {
  const isLast = index === 4;
  // Center progress for this card
  const centerP = index * 0.2;
  
  const scaleInput = centerP === 0 ? [0, 0.2] : isLast ? [0.6, 0.8] : [centerP - 0.2, centerP, centerP + 0.2];
  const scaleOutput = centerP === 0 ? [1.1, 0.85] : isLast ? [0.85, 1.1] : [0.85, 1.1, 0.85];
  const scale = useTransform(scrollYProgress, scaleInput, scaleOutput);

  const opacityInput = centerP === 0 ? [0, 0.2] : isLast ? [0.6, 0.8] : [centerP - 0.2, centerP, centerP + 0.2];
  const opacityOutput = centerP === 0 ? [1, 0.6] : isLast ? [0.6, 1] : [0.6, 1, 0.6];
  const opacity = useTransform(scrollYProgress, opacityInput, opacityOutput);

  const activeBg = index === 4 ? "#F48FB1" : "#FFCC80";
  const bgInput = centerP === 0 ? [0, 0.2] : isLast ? [0.6, 0.8] : [centerP - 0.2, centerP, centerP + 0.2];
  const bgOutput = centerP === 0 ? [activeBg, "#E0E0E0"] : isLast ? ["#E0E0E0", activeBg] : ["#E0E0E0", activeBg, "#E0E0E0"];
  const bgColor = useTransform(scrollYProgress, bgInput, bgOutput);

  const activeColor = index === 4 ? "#FFFFFF" : "#E65100";
  const colorInput = centerP === 0 ? [0, 0.2] : isLast ? [0.6, 0.8] : [centerP - 0.2, centerP, centerP + 0.2];
  const colorOutput = centerP === 0 ? [activeColor, "#9E9E9E"] : isLast ? ["#9E9E9E", activeColor] : ["#9E9E9E", activeColor, "#9E9E9E"];
  const color = useTransform(scrollYProgress, colorInput, colorOutput);
  
  // Custom label colors for the 5th item
  const displayDate = index === 4 ? "1 July" : date;

  // Add a slight tilt to the card depending on index
  const rotate = (index % 2 === 0 ? 1 : -1) * (2 + index * 1.5);
  
  return (
    <motion.div 
      className="w-[240px] h-[340px] shrink-0 rounded-3xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
      style={{ scale, opacity, backgroundColor: bgColor, rotate, willChange: 'transform, opacity' }}
    >
      {/* Notebook Grid Lines bg */}
      <div 
         className="absolute inset-0 opacity-[0.08]" 
         style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: 'center center'
         }} 
      />

      {/* Hand-drawn Doodles */}
      <motion.div style={{ color, opacity: 0.25 }} className="absolute inset-0 pointer-events-none">
        {index === 0 && (
           <>
             <Doodles.Star className="absolute top-10 left-6 w-10 h-10 -rotate-12" />
             <Doodles.Sparkle className="absolute bottom-12 right-8 w-12 h-12 rotate-12" />
           </>
        )}
        {index === 1 && (
           <>
             <Doodles.Ghost className="absolute top-6 right-6 w-12 h-12 rotate-6" />
             <Doodles.Heart className="absolute bottom-10 left-10 w-10 h-10 -rotate-6" />
           </>
        )}
        {index === 2 && (
           <>
             <Doodles.Cat className="absolute top-12 left-6 w-14 h-14 -rotate-12" />
             <Doodles.Star className="absolute bottom-6 right-10 w-8 h-8 rotate-45" />
           </>
        )}
        {index === 3 && (
           <>
             <Doodles.Sparkle className="absolute top-8 right-12 w-10 h-10 rotate-12" />
             <Doodles.Heart className="absolute bottom-12 left-6 w-12 h-12 -rotate-12" />
           </>
        )}
        {index === 4 && (
           <>
             <Doodles.Star className="absolute top-6 left-8 w-10 h-10 -rotate-12" />
             <Doodles.Star className="absolute top-10 right-8 w-8 h-8 rotate-12" />
             <Doodles.Heart className="absolute bottom-28 left-8 w-12 h-12 -rotate-6" />
             <Doodles.Sparkle className="absolute bottom-20 right-6 w-10 h-10 rotate-12" />
             <Doodles.Cat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] w-16 h-16 opacity-50" />
           </>
        )}
      </motion.div>

      <motion.span style={{ color }} className="text-3xl font-bold font-playful tracking-wide text-center uppercase z-10">
         {displayDate}
      </motion.span>
      {index === 4 && (
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0.75, 0.85], [0, 1]) }}
          className="absolute bottom-12 text-white font-bold text-xl font-playful whitespace-nowrap drop-shadow-sm z-10"
        >
          It's your birthday! 🎂
        </motion.div>
      )}
    </motion.div>
  )
}

const TimelineSection = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    container: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  // width of one card (240) + gap (40) = 280px
  // we have 5 cards, total move 4 * 280 = 1120px
  const x = useTransform(smoothProgress, [0, 0.8], ["0px", "-1120px"]);
  
  return (
    <section ref={targetRef} className="relative h-[400vh] w-full">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden bg-[#F3F1EC]">
        {/* We center the first card by adding left padding. */}
        <motion.div 
          className="flex gap-10 w-max" 
          style={{ x, xOrigin: 0, paddingLeft: "calc(50vw - 120px)", willChange: 'transform' }}
        >
          {dates.map((d, i) => (
            <DateCard key={d} date={d} index={i} scrollYProgress={smoothProgress} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const BowlSVG = () => (
   <svg width="180" height="120" viewBox="0 0 160 100" fill="none" className="drop-shadow-lg">
      <path d="M 10 20 C 10 100 150 100 150 20 Z" fill="#B0BEC5" />
      <ellipse cx="80" cy="20" rx="70" ry="15" fill="#90A4AE" />
   </svg>
);

const CakeSVG = ({ isBlown }: { isBlown: boolean }) => (
   <svg width="240" height="280" viewBox="0 0 240 280" fill="none" className="drop-shadow-2xl">
      {/* Plate */}
      <ellipse cx="120" cy="260" rx="110" ry="15" fill="#E0E0E0" />
      <ellipse cx="120" cy="255" rx="100" ry="12" fill="#F5F5F5" />
      
      {/* Bottom Tier */}
      <path d="M 40 255 L 40 160 C 40 150 200 150 200 160 L 200 255 C 200 265 40 265 40 255 Z" fill="#FFB74D" />
      <path d="M 40 160 C 40 150 200 150 200 160 C 200 170 40 170 40 160 Z" fill="#FF9800" />
      {/* Drip 1 */}
      <path d="M 40 165 Q 45 190 55 190 Q 65 190 70 165 Q 85 200 100 165 Q 115 185 130 165 Q 145 200 160 165 Q 175 190 185 190 Q 195 190 200 165 Z" fill="#FFE0B2" />

      {/* Top Tier */}
      <path d="M 60 165 L 60 80 C 60 70 180 70 180 80 L 180 165 C 180 175 60 175 60 165 Z" fill="#F48FB1" />
      <path d="M 60 80 C 60 70 180 70 180 80 C 180 90 60 90 60 80 Z" fill="#F06292" />
      {/* Drip 2 */}
      <path d="M 60 85 Q 70 110 80 110 Q 90 110 100 85 Q 115 125 130 85 Q 145 110 160 110 Q 170 110 180 85 Z" fill="#FFFFFF" />
      
      {/* Cherries */}
      <circle cx="80" cy="75" r="10" fill="#F44336" />
      <path d="M 80 65 Q 85 55 95 65" stroke="#795548" strokeWidth="2" fill="none" />
      <circle cx="160" cy="75" r="10" fill="#F44336" />
      <path d="M 160 65 Q 155 55 145 65" stroke="#795548" strokeWidth="2" fill="none" />
      <circle cx="120" cy="80" r="12" fill="#F44336" />
      <path d="M 120 68 Q 125 58 135 68" stroke="#795548" strokeWidth="2" fill="none" />
      
      {/* Candle */}
      <rect x="115" y="30" width="10" height="45" rx="4" fill="#E1BEE7" />
      {/* Stripes on Candle */}
      <path d="M 115 40 L 125 35 M 115 50 L 125 45 M 115 60 L 125 55 M 115 70 L 125 65" stroke="#BA68C8" strokeWidth="2" />
      
      {/* Flame */}
      {!isBlown && (
         <motion.g 
            animate={{ scale: [1, 1.1, 0.9, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{ transformOrigin: '120px 25px' }}
         >
            <path d="M 120 10 C 110 20 115 30 120 30 C 125 30 130 20 120 10 Z" fill="#FFC107" />
            <path d="M 120 15 C 115 22 117 28 120 28 C 123 28 125 22 120 15 Z" fill="#FF5722" />
         </motion.g>
      )}
      
      {/* Smoke visible when blown */}
      {isBlown && (
         <motion.path 
            initial={{ opacity: 1, pathLength: 0 }}
            animate={{ opacity: [1, 0], pathLength: [0, 1] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            d="M 120 25 Q 110 15 120 5 Q 130 -5 120 -15" 
            stroke="#9E9E9E" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
         />
      )}
   </svg>
);

const BakingAnimation = () => {
   return (
      <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
         <motion.div
            animate={{ 
               rotate: [0, -2, 2, -2, 0],
               y: [0, -5, 0, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="absolute z-10 bottom-32"
         >
            <BowlSVG />
         </motion.div>

         <motion.div 
            animate={{ x: [-80, -60, -80], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute left-1/2 ml-[-160px] bottom-28 -scale-x-100 z-0"
         >
            <div className="w-32 h-32">
               <CatSticker color="#FFB74D" />
            </div>
         </motion.div>

         <motion.div 
            animate={{ x: [80, 60, 80], y: [0, -25, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }}
            className="absolute left-1/2 ml-[30px] bottom-28 z-0"
         >
            <div className="w-32 h-32">
               <CatSticker color="#424242" />
            </div>
         </motion.div>
         
         <motion.div 
            animate={{ y: [-150, -180, -150], rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            className="absolute left-1/2 ml-[-60px] bottom-20 z-0"
         >
            <div className="w-32 h-32">
               <CatSticker color="#FFFFFF" />
            </div>
         </motion.div>

         <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute bottom-4 left-0 right-0 w-full text-center font-playful text-[#E65100] text-3xl font-bold tracking-wide z-20 px-4"
         >
            Baking a cake... 👩‍🍳🐈
         </motion.p>
      </div>
   )
}

const CakeSection = () => {
   const [phase, setPhase] = useState<'idle' | 'baking' | 'ready' | 'blown'>('idle');
   const ref = useRef<HTMLDivElement>(null);
   const [hasInteracted, setHasInteracted] = useState(false);

   useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
         if (entries[0].isIntersecting && phase === 'idle' && !hasInteracted) {
            setPhase('baking');
         }
      }, { threshold: 0.6 });
      
      if (ref.current) {
         observer.observe(ref.current);
      }
      return () => observer.disconnect();
   }, [phase, hasInteracted]);

   useEffect(() => {
      let timer: any;
      if (phase === 'baking') {
         timer = setTimeout(() => {
            setPhase('ready');
         }, 3500);
      }
      return () => clearTimeout(timer);
   }, [phase]);

   const handleBlowCandle = () => {
      setPhase('blown');
      setHasInteracted(true);
      
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
         confetti({
            particleCount: 8,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFB74D', '#FFCC80', '#F48FB1', '#E65100', '#F06292', '#BA68C8']
         });
         confetti({
            particleCount: 8,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFB74D', '#FFCC80', '#F48FB1', '#E65100', '#F06292', '#BA68C8']
         });

         if (Date.now() < end) {
            requestAnimationFrame(frame);
         }
      };
      
      frame();
   }

   return (
      <section ref={ref} className="w-full h-screen shrink-0 flex flex-col items-center justify-center relative overflow-hidden bg-[#F3F1EC]">
         {phase === 'baking' && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.8 }}
               className="w-full flex justify-center"
            >
               <BakingAnimation />
            </motion.div>
         )}

         {(phase === 'ready' || phase === 'blown') && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5, y: 50 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ type: 'spring', bounce: 0.6, duration: 1 }}
               className="flex flex-col items-center z-20 w-full"
            >
               <div className="h-[96px] md:h-[116px] mb-6 flex items-center justify-center w-full">
                  {phase === 'blown' ? (
                     <motion.h1 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.6, delay: 0.5 }}
                        className="font-playful text-5xl md:text-7xl lg:text-8xl font-bold text-[#E65100] text-center px-4"
                     >
                        Happy Birthday! 🎉
                     </motion.h1>
                  ) : null}
               </div>

               <CakeSVG isBlown={phase === 'blown'} />

               <div className="mt-12 h-[80px] w-full flex items-center justify-center">
                  {phase === 'ready' && (
                     <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={handleBlowCandle}
                        className="px-8 py-4 bg-[#E65100] hover:bg-[#EF6C00] text-[#F3F1EC] rounded-full font-bold text-xl md:text-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                     >
                        Make a Wish & Blow Candle ✨
                     </motion.button>
                  )}
               </div>
            </motion.div>
         )}
      </section>
   )
}

const JellyRevealSection = () => {
   const [windowSize, setWindowSize] = useState({ w: 1000, h: 800 });
   
   useEffect(() => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   return (
      <section className="w-full h-screen shrink-0 relative overflow-hidden bg-white">
         {/* Background Solid Color Layer with Text */}
         <div className="absolute inset-0 flex flex-col justify-center items-start p-6 md:p-16 lg:p-24 z-0">
            <h1 className="font-cute text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[7rem] text-pink-500 leading-[0.9] tracking-tight w-full max-w-6xl opacity-90 drop-shadow-sm">
               "Oh kyon<br/>nai jaan sake, <br/><span className="text-pink-400">Kinna pyaar<br/>si naal ohde"</span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl lg:text-3xl text-pink-400 max-w-3xl font-medium leading-snug drop-shadow-sm font-cute">
               Why couldn't they see how much love she carried?<br/><br/>
               This <strong className="text-pink-500">IS</strong> her. Kind-hearted, deep love, but never truly seen.
            </p>
         </div>

         {/* Image Layer Masked by Shape (The background image revealing through) */}
         <div className="absolute inset-0 z-10 pointer-events-none mix-blend-normal flex items-center justify-center">
            <div className="relative w-full h-full md:aspect-[9/16] md:w-auto overflow-hidden">
               <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                     {/* Mask definition - Moving shapes */}
                     <mask id="cat-spotlight">
                        {/* Primary large moving shape */}
                        <motion.g
                           animate={{
                              x: [windowSize.w * 0.3, windowSize.w * 0.6, windowSize.w * 0.4, windowSize.w * 0.3],
                              y: [windowSize.h * 0.3, windowSize.h * 0.6, windowSize.h * 0.2, windowSize.h * 0.3],
                           }}
                           transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
                        >
                           <circle cx="0" cy="0" r="100" fill="white" />
                        </motion.g>

                        {/* Secondary smaller shape */}
                        <motion.g
                           animate={{
                              x: [windowSize.w * 0.7, windowSize.w * 0.2, windowSize.w * 0.8, windowSize.w * 0.7],
                              y: [windowSize.h * 0.8, windowSize.h * 0.3, windowSize.h * 0.7, windowSize.h * 0.8],
                           }}
                           transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
                        >
                           <circle cx="0" cy="0" r="80" fill="white" />
                        </motion.g>

                        {/* Extra wandering shape */}
                        <motion.g
                           animate={{
                              x: [windowSize.w * 0.1, windowSize.w * 0.9, windowSize.w * 0.5, windowSize.w * 0.1],
                              y: [windowSize.h * 0.2, windowSize.h * 0.8, windowSize.h * 0.9, windowSize.h * 0.2],
                           }}
                           transition={{ duration: 35, ease: "easeInOut", repeat: Infinity }}
                        >
                           <circle cx="0" cy="0" r="50" fill="white" />
                        </motion.g>
                     </mask>
                  </defs>

                  <image 
                     href="https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1080&h=1920&fit=crop" 
                     width="100%" height="100%" 
                     preserveAspectRatio="xMidYMid slice"
                     mask="url(#cat-spotlight)"
                  />
               </svg>
            </div>
         </div>
      </section>
   )
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [introPhase, setIntroPhase] = useState<'gathering' | 'disappearing' | 'text' | 'scrolling'>('gathering');
  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLElement>(null);
  
  const { scrollYProgress: section1Progress } = useScroll({ 
     target: section1Ref,
     container: containerRef,
     offset: ["start start", "end start"]
  });

  // Fade out section 1 as user scrolls
  const opacitySection1 = useTransform(section1Progress, [0, 0.8], [1, 0]);

  // Derive initial and final positions precisely once.
  const cats = useMemo(() => {
    let data = [];
    const count = 75; // Increased the cloud density now that performance is >100x better
    for (let i = 0; i < count; i++) {
       const startAngle = Math.random() * Math.PI * 2;
       const startRadius = 1500 + Math.random() * 1000;
       const startX = Math.cos(startAngle) * startRadius;
       const startY = Math.sin(startAngle) * startRadius;

       // Final clustered position using a tighter radius distribution
       const clusterMaxRadius = 240; 
       // Math.sqrt helps distribute points evenly inside a circle instead of heavily biased to center
       const endRadius = Math.sqrt(Math.random()) * clusterMaxRadius;
       const endAngle = Math.random() * Math.PI * 2;
       
       // Add a slight bias to compress vertically to match an organic bouquet shape
       const endX = Math.cos(endAngle) * endRadius;
       const endY = Math.sin(endAngle) * (endRadius * 0.85);

       const rotationStart = (Math.random() - 0.5) * 1080; // 3 full spins
       const rotationEnd = (Math.random() - 0.5) * 60; // gentle final tilt
       
       // Center cats load slightly later for stacking effect
       const distanceToCenter = endRadius / clusterMaxRadius;
       
       data.push({
          id: i,
          color: catColors[Math.floor(Math.random() * catColors.length)],
          startX, startY,
          endX, endY,
          rotationStart, rotationEnd,
          delay: (1 - distanceToCenter) * 0.6 + Math.random() * 0.8, // 0s to ~1.4s staggering
          duration: 1.2 + Math.random() * 0.6,
          scale: 0.7 + Math.random() * 0.45, // variety in cat sizes
       })
    }
    
    // Sort array so that cats lower down (higher Y) render on top, enhancing 3D depth.
    data.sort((a, b) => a.endY - b.endY);
    
    return data;
  }, []);

  useEffect(() => {
    // Small timeout ensures initial state isn't skipped by browser render batching
    const timer = setTimeout(() => setMounted(true), 100);
    const t1 = setTimeout(() => setIntroPhase('disappearing'), 3500);
    const t2 = setTimeout(() => setIntroPhase('text'), 4500);
    const t3 = setTimeout(() => setIntroPhase('scrolling'), 6000);
    return () => { clearTimeout(timer); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-screen bg-[#F3F1EC] ${introPhase === 'scrolling' ? 'overflow-y-auto' : 'overflow-hidden'} overflow-x-hidden font-sans scroll-smooth relative`}>
      
      {/* SECTION 1: The Bouquet */}
      <motion.section 
        ref={section1Ref}
        style={{ opacity: opacitySection1 }}
        className="w-full h-screen shrink-0 flex items-center justify-center relative overflow-hidden pointer-events-none"
      >
         {/* Decorative gathering of cats */}
         <div className="relative w-0 h-0 flex items-center justify-center mb-16">
            {mounted && cats.map((cat, index) => (
               <CatScatterItem key={cat.id} cat={cat} scrollYProgress={section1Progress} introPhase={introPhase} />
            ))}
         </div>

         {/* Gentle Typography revealing itself below the cluster */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: (introPhase === 'text' || introPhase === 'scrolling') ? 1 : 0, y: (introPhase === 'text' || introPhase === 'scrolling') ? 0 : 30 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-24 lg:bottom-40 text-center text-[#4A4744] tracking-[0.1em]"
         >
            <p className="text-xl md:text-2xl font-medium mb-3">A gathering of cuteness,</p>
            <p className="text-base md:text-lg">just for you.</p>
            
            <motion.div 
               animate={{ y: [0, 8, 0] }} 
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               className="mt-12 opacity-50 flex flex-col items-center"
            >
               <span className="text-xs uppercase tracking-widest mb-2">Scroll Down</span>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </motion.div>
         </motion.div>
      </motion.section>

      {/* SECTION 2: Timeline */}
      <TimelineSection containerRef={containerRef} />

      {/* SECTION 3: Cake Baking & Blowing Candles */}
      <CakeSection />

      {/* SECTION 4: Jelly Reveal */}
      <JellyRevealSection />

    </div>
  );
}

