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

        // Explicitly set pointer-events: none on the canvas
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1'; // Ensure the canvas has a low z-index
        console.log('Canvas pointer-events after setting:', canvas.style.pointerEvents);
        console.log('Canvas z-index after setting:', canvas.style.zIndex);

        // Debug: Log the computed styles
        console.log('Canvas pointer-events (computed):', window.getComputedStyle(canvas).pointerEvents);
        console.log('Canvas z-index (computed):', window.getComputedStyle(canvas).zIndex);

        const handleMouseMove = (event) => {
          console.log('Mouse moved:', event.clientX, event.clientY);
          console.log('Mouse move event target:', event.target, 'tagName:', event.target.tagName);
          if (!pJSDomReadyRef.current) {
            console.log('pJSDom not ready yet, skipping repulse logic');
            return;
          }
          if (!particlesReadyRef.current) {
            console.log('Particles not ready yet, skipping repulse logic');
            return;
          }

          // Skip if the event target is an interactive element (button, link, input, etc.)
          const target = event.target;
          const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
          const targetTagName = target.tagName ? target.tagName.toUpperCase() : '';
          if (interactiveElements.includes(targetTagName)) {
            console.log('Mouse move event target is an interactive element, skipping particle effects');
            return;
          }

          // Skip if the target is the particles-container or particles-js div
          if (target.classList.contains('particles-container') || target.id === 'particles-js') {
            console.log('Mouse move event target is particles-container or particles-js, skipping particle effects');
            return;
          }

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();

          // Check if the mouse is within the canvas bounds
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          if (
            mouseX < 0 ||
            mouseX > rect.width ||
            mouseY < 0 ||
            mouseY > rect.height
          ) {
            console.log('Mouse outside canvas bounds, skipping particle effects');
            return;
          }

          // Update mouse position for repulse effect
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
          console.log('Click event target:', event.target, 'tagName:', event.target.tagName);
          console.log('Click event target parent:', event.target.parentElement);
          if (!pJSDomReadyRef.current) {
            console.log('pJSDom not ready yet, skipping push logic');
            return;
          }
          if (!particlesReadyRef.current) {
            console.log('Particles not ready yet, skipping push logic');
            return;
          }

          // Skip if the event target is an interactive element (button, link, input, etc.)
          const target = event.target;
          const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
          const targetTagName = target.tagName ? target.tagName.toUpperCase() : '';
          if (interactiveElements.includes(targetTagName)) {
            console.log('Click event target is an interactive element, skipping particle effects');
            return;
          }

          // Skip if the target is the particles-container or particles-js div
          if (target.classList.contains('particles-container') || target.id === 'particles-js') {
            console.log('Click event target is particles-container or particles-js, skipping particle effects');
            return;
          }

          const pJS = window.pJSDom[0].pJS;
          const rect = canvas.getBoundingClientRect();

          // Check if the click is within the canvas bounds
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          if (
            mouseX < 0 ||
            mouseX > rect.width ||
            mouseY < 0 ||
            mouseY > rect.height
          ) {
            console.log('Click outside canvas bounds, skipping particle effects');
            return;
          }

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

        // Attach event listeners to the document instead of the canvas
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        console.log('Event listeners added to document');

        // Debug: Add a test click listener directly on the document
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