import { useEffect, useState } from 'react';


interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}


/**
 * Editorial-style splash screen with anatomical hero and animated callouts.
 * Auto-hides after `durationMs` (default 2500ms). Clicking skips immediately.
 */
export default function SplashScreen({ onComplete, durationMs = 2500 }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), durationMs);
    const t2 = setTimeout(() => onComplete(), durationMs + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [durationMs, onComplete]);

  function skip() {
    setExiting(true);
    setTimeout(() => onComplete(), 600);
  }

  return (
    <div className={`splash ${exiting ? 'exiting' : ''}`} onClick={skip}>
      <div className="splash-frame">
        <div className="splash-eyebrow">
          <span className="line"></span>
          <span className="label">
            <span style={{ color: 'var(--text-5)' }}>Plate I</span>
            <span style={{ color: 'var(--text-5)', margin: '0 8px' }}>·</span>
            Combat Anatomy
            <span style={{ color: 'var(--text-5)', margin: '0 8px' }}>·</span>
            <span className="red">v0.1</span>
          </span>
          <span className="line"></span>
        </div>

        <div className="splash-figure">
          <img src="/assets/anatomy.png" className="anatomy-img" alt="" />

          <div className="callout" style={{ top: '18%', left: '0%', animationDelay: '1.1s' }}>
            <span className="dot"></span>
            <span className="line"></span>
            <span>ANT. DELTOID</span>
          </div>
          <div className="callout right" style={{ top: '34%', right: '0%', animationDelay: '1.3s' }}>
            <span>EXT. CARPI ULNARIS</span>
            <span className="line"></span>
            <span className="dot"></span>
          </div>
          <div className="callout" style={{ bottom: '22%', left: '-2%', animationDelay: '1.5s' }}>
            <span className="dot"></span>
            <span className="line"></span>
            <span>RECTUS FEMORIS</span>
          </div>
          <div className="callout right" style={{ bottom: '36%', right: '-2%', animationDelay: '1.7s' }}>
            <span>GLUTEUS MAXIMUS</span>
            <span className="line"></span>
            <span className="dot"></span>
          </div>
        </div>

        <div className="splash-wordmark">
          <span className="punch">Punch</span>
          <span className="iq">IQ</span>
        </div>

        <div className="splash-tagline">— Boxing prediction &amp; analysis —</div>
      </div>

      <div className="splash-foot">
        <div>RND_FOREST · 80.9% ACC · SHAP_v0.51</div>
        <div className="dots"><span></span><span></span><span></span></div>
        <div>2026 · PORTFOLIO · CLICK TO SKIP</div>
      </div>
    </div>
  );
}
