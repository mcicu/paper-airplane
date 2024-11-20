"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

// Telegram Web Apps API is accessed via the global `window.Telegram` object
declare global {
    interface Window {
        Telegram: Telegram;
    }
}

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Screen dimensions
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenHeight, setScreenHeight] = useState(0);

    // Game state
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // User info from Telegram
    const [telegramState, setTelegramState] = useState("Undefined");
    const [user, setUser] = useState<{ id: number; name: string; photoUrl?: string } | null>(null);

    // Bird and pipe positions stored in refs
    const birdRef = useRef({ y: screenHeight / 2, velocity: 0 });
    const pipesRef = useRef<Array<{ x: number; gap: number }>>([]);
    const frameRef = useRef<number | null>(null);

    // Constants adjusted for screen size
    const gravity = 0.5;
    const flapStrength = -10;
    const pipeSpeed = screenWidth * 0.002; // Speed scales with screen width
    const pipeWidth = screenWidth * 0.1;
    const pipeGap = screenHeight * 0.25;

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight-100);
        };

        handleResize(); //call once on startup

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Telegram Web Apps API Initialization
    useEffect(() => {
        const telegram = window.Telegram?.WebApp;

        if (telegram) {
            telegram.ready(); // Notify Telegram that the app is ready
            const userInfo = telegram.initDataUnsafe?.user;

            if (userInfo) {
                setUser({
                    id: userInfo.id,
                    name: `${userInfo.first_name} ${userInfo.last_name || ""}`.trim(),
                    photoUrl: userInfo.photo_url,
                });
                setTelegramState(`User info set [user id = ${userInfo.id}]`);
            } else {
                setTelegramState("User info is not available. Check bot and domain configuration.");
            }
        } else {
            setTelegramState("Telegram is unavailable");
        }
    }, []);

    // Reset the game
    const resetGame = useCallback(() => {
        birdRef.current = { y: screenHeight / 2, velocity: 0 };
        pipesRef.current = Array.from({ length: 3 }, (_, i) => ({
            x: screenWidth + i * (screenWidth / 2),
            gap: Math.random() * (screenHeight * 0.4) + (screenHeight * 0.1),
        }));
        setScore(0);
        setGameOver(false);
    }, [screenWidth, screenHeight]);

    // Handle bird flap
    const handleFlap = useCallback(() => {
        if (!gameOver) {
            birdRef.current.velocity = flapStrength;
        } else {
            resetGame();
        }
    }, [gameOver, resetGame]);

    // Main game loop
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");

        const render = () => {
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, screenWidth, screenHeight);

            // Update bird position
            birdRef.current.y += birdRef.current.velocity;
            birdRef.current.velocity += gravity;

            // Check for collisions with ground or ceiling
            if (birdRef.current.y <= 0 || birdRef.current.y >= screenHeight) {
                setGameOver(true);
                return;
            }

            // Draw bird
            ctx.fillStyle = "blue";
            ctx.fillRect(50, birdRef.current.y, screenWidth * 0.05, screenHeight * 0.05);

            // Update pipes and check for collisions
            let pipes = pipesRef.current;
            pipes = pipes.map((pipe) => ({
                ...pipe,
                x: pipe.x - pipeSpeed,
            }));

            pipes.forEach((pipe) => {
                // Draw top and bottom pipes
                ctx.fillStyle = "green";
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gap);
                ctx.fillRect(
                    pipe.x,
                    pipe.gap + pipeGap,
                    pipeWidth,
                    screenHeight - pipe.gap - pipeGap
                );

                // Collision detection
                const pipeBottom = pipe.gap + pipeGap;
                if (
                    pipe.x < 70 &&
                    pipe.x + pipeWidth > 50 &&
                    (birdRef.current.y < pipe.gap || birdRef.current.y > pipeBottom)
                ) {
                    setGameOver(true);
                    return;
                }

                // Score increment
                if (pipe.x + pipeWidth === 50) {
                    setScore((prevScore) => prevScore + 1);
                }
            });

            // Remove off-screen pipes and add new pipes
            if (pipes[0]?.x + pipeWidth < 0) {
                pipes.shift();
                pipes.push({
                    x: screenWidth,
                    gap: Math.random() * (screenHeight * 0.4) + (screenHeight * 0.1),
                });
            }

            pipesRef.current = pipes;

            // Draw score
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`Score: ${score}`, 10, 20);

            frameRef.current = requestAnimationFrame(render);
        };

        if (!gameOver) {
            frameRef.current = requestAnimationFrame(render);
        }

        return () => {
            if (typeof frameRef.current === 'number') {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [gameOver, score, screenWidth, screenHeight]);

    // Handle spacebar input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                handleFlap();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleFlap]);

    return (
        <div
            className="w-full h-screen flex items-center justify-center bg-gray-100 relative"
            onMouseDown={handleFlap}
            onTouchStart={handleFlap}
        >
            <canvas ref={canvasRef} width={screenWidth} height={screenHeight}/>
            {gameOver && (
                <div className="absolute text-2xl text-red-600">
                    Game Over! Score: {score} <br/>
                    Tap or press space to restart! <br />
                    Telegram API state: {telegramState}
                </div>
            )}
            {user && (
                <div className="absolute top-4 left-4 flex items-center space-x-4">
                    <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <span className="text-lg font-bold text-red-500">{user.name}</span>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
