import React, { useEffect, useState, useRef } from 'react';

const ParticlesBackground = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [pJSDomReady, setPJSDomReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const particlesInitialized = useRef(false); // Track if particles.js has been initialized
  const pJSDomReadyRef = useRef(pJSDomReady); // Track latest pJSDomReady value
  const particlesReadyRef = useRef(particlesReady); // Track latest particlesReady value

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
        setTimeout(checkScriptLoaded, 100); // Retry every 100ms
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

    particlesInitialized.current = true; // Mark as initialized
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
            enable: false,
          },
          resize: true,
        },
      },
      retina_detect: true,
    });
    console.log('particles.js initialized');

    // Check for pJSDom availability
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

    // Check for particles availability
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

    // Wait for the canvas to be created by particles.js
    let canvas = null;
    const setupEventListeners = () => {
      const container = document.getElementById('particles-js');
      canvas = container.querySelector('.particles-js-canvas-el');
      if (canvas) {
        console.log('Canvas element found:', canvas);
        setParticlesLoaded(true);

        // Debug: Log the canvas's pointer-events style
        console.log('Canvas pointer-events:', window.getComputedStyle(canvas).pointerEvents);

        const handleMouseMove = (event) => {
          console.log('Mouse moved:', event.clientX, event.clientY);
          if (!pJSDomReadyRef.current) {
            console.log('pJSDom not ready yet, skipping repulse logic');
            return;
          }
          if (!particlesReadyRef.current) {
            console.log('Particles not ready yet, skipping repulse logic');
            return;
          }

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          // Update mouse position
          pJS.interactivity.mouse.pos_x = mouseX;
          pJS.interactivity.mouse.pos_y = mouseY;
          console.log('Mouse position in canvas coordinates:', mouseX, mouseY);

          // Repulse effect: Adjust particle velocity to move away from cursor
          const particles = pJS.particles.array;
          console.log('Number of particles:', particles.length);
          if (particles.length === 0) {
            console.log('No particles available to repulse');
            return;
          }

          particles.forEach((particle, index) => {
            console.log(`Particle ${index} position: x=${particle.x}, y=${particle.y}`);
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log(`Particle ${index}: Distance=${distance.toFixed(2)}`);

            const repulseDistance = 100;
            const repulseForce = 5;

            if (distance < repulseDistance) {
              const angle = Math.atan2(dy, dx);
              const force = (repulseDistance - distance) / repulseDistance * repulseForce;
              console.log(`Particle ${index}: Distance=${distance.toFixed(2)}, Force=${force.toFixed(4)}, Angle=${angle.toFixed(2)}`);
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
              console.log(`Particle ${index} new velocity: vx=${particle.vx.toFixed(2)}, vy=${particle.vy.toFixed(2)}`);
              setTimeout(() => {
                console.log(`Particle ${index} updated position: x=${particle.x}, y=${particle.y}`);
              }, 100);
            }
          });
        };

        const handleClick = (event) => {
          console.log('Mouse clicked:', event.clientX, event.clientY);
          if (!pJSDomReadyRef.current) {
            console.log('pJSDom not ready yet, skipping push logic');
            return;
          }
          if (!particlesReadyRef.current) {
            console.log('Particles not ready yet, skipping push logic');
            return;
          }

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          // Push effect: Add new particles at the cursor position
          const particlesToAdd = 5; // Number of particles to add per click
          console.log(`Adding ${particlesToAdd} particles at position: x=${mouseX}, y=${mouseY}`);

          // Add particles using pJS.fn.particlesCreate
          for (let i = 0; i < particlesToAdd; i++) {
            pJS.fn.particlesCreate();
            // Get the last particle (newly created)
            const particle = pJS.particles.array[pJS.particles.array.length - 1];
            if (!particle) {
              console.error('Failed to retrieve newly created particle');
              continue;
            }
            // Set the particle's position to the cursor
            particle.x = mouseX;
            particle.y = mouseY;
            // Set random velocity
            particle.vx = (Math.random() - 0.5) * 2; // Random velocity between -1 and 1
            particle.vy = (Math.random() - 0.5) * 2;
          }

          // Update the particle count in pJS
          pJS.particles.count = pJS.particles.array.length;
          console.log('New particle count after push:', pJS.particles.array.length);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);
        console.log('Event listeners added to canvas');

        // Debug: Add a test click listener directly on the canvas
        canvas.addEventListener('click', (event) => {
          console.log('Direct canvas click detected:', event.clientX, event.clientY);
        });

        return () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('click', handleClick);
          console.log('Event listeners removed from canvas');
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
    <div className="particles-container">
      <div id="particles-js" style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}></div>
      {!particlesLoaded && (
        <div className="particles-fallback">
          Particles failed to load. Check the console for errors.
        </div>
      )}
    </div>
  );
};

export default ParticlesBackground;