import React, { useEffect, useState, useRef } from 'react';

const ParticlesBackground = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [pJSDomReady, setPJSDomReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const particlesInitialized = useRef(false);
  const pJSDomReadyRef = useRef(pJSDomReady);
  const particlesReadyRef = useRef(particlesReady);
  const clickCount = useRef(0); // Track the number of clicks
  const MAX_CLICKS = 1; // Limit to 1 click

  // Update refs whenever the state changes
  useEffect(() => {
    pJSDomReadyRef.current = pJSDomReady;
  }, [pJSDomReady]);

  useEffect(() => {
    particlesReadyRef.current = particlesReady;
  }, [particlesReady]);

  useEffect(() => {
    console.log('ParticlesBackground component mounted');

    const checkScriptLoaded = () => {
      if (window.particlesJS) {
        console.log('particlesJS available:', window.particlesJS);
        setScriptLoaded(true);
      } else {
        console.log('particlesJS not yet available, retrying...');
        setTimeout(checkScriptLoaded, 100);
      }
    };

    checkScriptLoaded();

    return () => {
      // Cleanup: Remove particles on unmount
      if (window.particlesJS && particlesInitialized.current) {
        console.log('Cleaning up particles.js');
        window.particlesJS('particles-js', { particles: { number: { value: 0 } } });
        particlesInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.particlesJS || particlesInitialized.current) {
      if (scriptLoaded && !window.particlesJS) {
        console.error('particlesJS not found even after script load attempt.');
      }
      return;
    }

    particlesInitialized.current = true;
    console.log('Initializing particles.js');
    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: ['#a3a3ff', '#00aaff'],
        },
        shape: {
          type: 'star',
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: false,
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: false,
          },
          onclick: {
            enable: false, // Disabled since we're handling clicks manually
          },
          resize: true,
        },
      },
      retina_detect: true,
    });
    console.log('particles.js initialized');

    const checkPJSDom = () => {
      if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        console.log('pJSDom is ready');
        console.log('pJSDom instances:', window.pJSDom.length);
        setPJSDomReady(true);
      } else {
        console.log('pJSDom not yet available, retrying...');
        setTimeout(checkPJSDom, 100);
      }
    };

    const checkParticles = () => {
      if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        const particles = window.pJSDom[0].pJS.particles.array;
        console.log('Checking particles, current count:', particles.length);
        if (particles.length > 0) {
          console.log('Particles are ready, count:', particles.length);
          setParticlesReady(true);
        } else {
          console.log('Particles not yet available, retrying...');
          setTimeout(checkParticles, 100);
        }
      } else {
        console.log('pJSDom not available for particle check, retrying...');
        setTimeout(checkParticles, 100);
      }
    };

    let canvas = null;
    const setupEventListeners = () => {
      const container = document.getElementById('particles-js');
      canvas = container.querySelector('.particles-js-canvas-el');
      if (canvas) {
        console.log('Canvas element found:', canvas);
        setParticlesLoaded(true);

        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';

        console.log('Canvas pointer-events after setting:', canvas.style.pointerEvents);
        console.log('Canvas z-index after setting:', canvas.style.zIndex);

        console.log('Canvas pointer-events (computed):', window.getComputedStyle(canvas).pointerEvents);
        console.log('Canvas z-index (computed):', window.getComputedStyle(canvas).zIndex);

        const handleMouseMove = (event) => {
          console.log('Mouse moved:', event.clientX, event.clientY);
          if (!pJSDomReadyRef.current || !particlesReadyRef.current) return;

          const target = event.target;
          const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
          if (interactiveElements.includes(target.tagName?.toUpperCase()) ||
              target.classList.contains('particles-container') ||
              target.id === 'particles-js') return;

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) return;

          pJS.interactivity.mouse.pos_x = mouseX;
          pJS.interactivity.mouse.pos_y = mouseY;

          const particles = pJS.particles.array;
          particles.forEach((particle, index) => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const repulseDistance = 100;
            const repulseForce = 5;

            if (distance < repulseDistance) {
              const angle = Math.atan2(dy, dx);
              const force = (repulseDistance - distance) / repulseDistance * repulseForce;
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
            }
          });
        };

        const handleClick = (event) => {
          console.log('Mouse clicked:', event.clientX, event.clientY);
          if (!pJSDomReadyRef.current || !particlesReadyRef.current || clickCount.current >= MAX_CLICKS) {
            console.log(`Click limit reached (${clickCount.current}/${MAX_CLICKS}) or not ready, skipping push logic`);
            return;
          }

          const target = event.target;
          const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
          if (interactiveElements.includes(target.tagName?.toUpperCase()) ||
              target.classList.contains('particles-container') ||
              target.id === 'particles-js') return;

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) return;

          const particlesToAdd = 5;
          console.log(`Adding ${particlesToAdd} particles at position: x=${mouseX}, y=${mouseY}`);

          for (let i = 0; i < particlesToAdd; i++) {
            pJS.fn.particlesCreate();
            const particle = pJS.particles.array[pJS.particles.array.length - 1];
            if (particle) {
              particle.x = mouseX;
              particle.y = mouseY;
              particle.vx = (Math.random() - 0.5) * 2;
              particle.vy = (Math.random() - 0.5) * 2;
            }
          }

          pJS.particles.count = pJS.particles.array.length;
          clickCount.current += 1; // Increment click counter
          console.log('New particle count after push:', pJS.particles.array.length, `Click count: ${clickCount.current}/${MAX_CLICKS}`);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);

        document.addEventListener('click', (event) => {
          console.log('Direct document click detected:', event.clientX, event.clientY);
        });

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('click', handleClick);
          console.log('Event listeners removed from document');
        };
      } else {
        console.log('Canvas element not yet available, retrying...');
        setTimeout(setupEventListeners, 100);
      }
    };

    setupEventListeners();
    checkPJSDom();
    checkParticles();
  }, [scriptLoaded]);

  return (
    <div className="particles-container" style={{ pointerEvents: 'none' }}>
      <div id="particles-js" style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: -1 }}></div>
      {!particlesLoaded && (
        <div className="particles-fallback">
          Particles failed to load. Check the console for errors.
        </div>
      )}
      <style>
        {`
          #particles-js, #particles-js * {
            pointer-events: none !important;
            z-index: -1 !important;
          }
          .particles-container {
            pointer-events: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default ParticlesBackground;