import { useEffect, useState } from 'react';


interface SplashScreenProps {
  onComplete: () => void;
}


export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Étape 1 : déclenche le fade-out après 2.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    // Étape 2 : unmount complet après que le fade soit terminé (500ms plus tard)
    const unmountTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-8 px-6">
        <img
          src="/splash.png"
          alt="Boxers anatomy"
          className="max-w-2xl max-h-[60vh] mx-auto opacity-70 grayscale select-none"
        />
        <div>
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="text-red-500">Punch</span>IQ
          </h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs mt-3">
            Boxing prediction · powered by machine learning
          </p>
        </div>
      </div>
    </div>
  );
}