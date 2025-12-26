import React, { useEffect, useRef } from 'react';

const pastelColors = [
    'rgba(255, 150, 170, 0.75)',
    'rgba(135, 206, 250, 0.75)',
    'rgba(255, 200, 150, 0.75)',
    'rgba(210, 140, 210, 0.75)',
    'rgba(130, 240, 130, 0.75)',
    'rgba(255, 240, 180, 0.75)',
    'rgba(150, 210, 240, 0.75)',
    'rgba(255, 170, 190, 0.75)'
];

class ConfettiParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 6 + 3;
        this.speedY = Math.random() * 1 + 0.3;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.4 + 0.4;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        return this.y <= this.canvas.height + 20;
    }
}

const ConfettiOverlay = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationIdRef = useRef(null);
    const loopRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const drawParticle = (p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current = particlesRef.current.filter((p) => {
                const alive = p.update();
                drawParticle(p);
                return alive;
            });

            // maintain a gentle stream by topping up
            const maxParticles = 120;
            if (particlesRef.current.length < maxParticles) {
                const toAdd = Math.min(4, maxParticles - particlesRef.current.length);
                for (let i = 0; i < toAdd; i += 1) {
                    particlesRef.current.push(new ConfettiParticle(canvas));
                }
            }

            if (particlesRef.current.length > 0) {
                animationIdRef.current = requestAnimationFrame(animate);
            } else {
                animationIdRef.current = null;
                if (loopRef.current) {
                    createConfetti();
                }
            }
        };

        const createConfetti = () => {
            for (let i = 0; i < 60; i += 1) {
                setTimeout(() => {
                    particlesRef.current.push(new ConfettiParticle(canvas));
                    if (!animationIdRef.current) {
                        animate();
                    }
                }, i * 20);
            }
        };

        // fire once on mount and keep looping
        loopRef.current = true;
        createConfetti();

        return () => {
            window.removeEventListener('resize', resize);
            loopRef.current = false;
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className="confetti-canvas" />;
};

export default ConfettiOverlay;
