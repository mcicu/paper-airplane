"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";

function drawPaperAirplane(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);         // Nose of the airplane
    ctx.lineTo(50, 0);      // Top edge of the tail
    ctx.lineTo(0, 10);       // Bottom point
    ctx.lineTo(0, 0);        // Back to the nose
    ctx.closePath();

    ctx.fillStyle = "#99ceff"; // Light gray for the airplane
    ctx.fill();
    ctx.strokeStyle = "#309ae5"; // Dark outline
    ctx.lineWidth = 2;
    ctx.stroke();

    //left wing
    ctx.beginPath();
    ctx.moveTo(0, -4);         // Nose of the airplane
    ctx.lineTo(50, 0);      // Top edge of the tail
    ctx.lineTo(4, -9);       // Bottom point
    ctx.lineTo(0, -4);        // Back to the nose
    ctx.closePath();

    ctx.fillStyle = "#81c7ff"; // Light gray for the airplane
    ctx.fill();
    ctx.strokeStyle = "#2089d3"; // Dark outline
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}


interface GameCanvasProps {
    handleScoreUpdate: (value: number) => void
}

const GameCanvas = ({handleScoreUpdate}: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    // Screen dimensions
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenHeight, setScreenHeight] = useState(0);

    // Game state
    const [gameState, setGameState] = useState<"NOT_STARTED" | "GAME_OVER" | "RUNNING">("NOT_STARTED");
    const [score, setScore] = useState(0);

    // plane and pipe positions stored in refs
    const planeRef = useRef({y: screenHeight / 2, velocity: 0});
    const pipesRef = useRef<Array<{ x: number; gap: number }>>([]);
    const frameRef = useRef<number | null>(null);

    // Constants adjusted for screen size
    const gravity = 0.4;
    const flapStrength = -6;
    const pipeSpeed = screenWidth * 0.003; // Speed scales with screen width
    const pipeWidth = screenWidth * 0.1;
    const pipeGap = screenHeight * 0.25;

    const handleGameOver = function () {
        setGameState("GAME_OVER");
        handleScoreUpdate(score);
    }

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasWrapperRef.current) {
                setScreenWidth(canvasWrapperRef.current.offsetWidth);
                setScreenHeight(canvasWrapperRef.current.offsetHeight);
            }
        };

        handleResize(); //call once on startup

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Reset the game
    const resetGame = useCallback(() => {
        planeRef.current = {y: screenHeight / 2, velocity: 0};
        pipesRef.current = Array.from({length: 3}, (_, i) => ({
            x: screenWidth + i * (screenWidth / 2),
            gap: Math.random() * (screenHeight * 0.4) + (screenHeight * 0.1),
        }));
        setScore(0);
    }, [screenWidth, screenHeight]);

    // Handle plane flap
    const handleFlap = useCallback(() => {
        if (gameState === "NOT_STARTED" || gameState === "GAME_OVER") {
            resetGame();
            setGameState("RUNNING");
        }

        if (gameState === "RUNNING") {
            planeRef.current.velocity = flapStrength;
        }

    }, [flapStrength, gameState, resetGame]);

    // Main game loop
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");

        const render = () => {
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, screenWidth, screenHeight);

            // Update plane position
            planeRef.current.y += planeRef.current.velocity;
            planeRef.current.velocity += gravity;

            // Check for collisions with ground or ceiling
            if (planeRef.current.y <= 0 || planeRef.current.y >= screenHeight) {
                handleGameOver();
                return;
            }

            // Draw plane
            drawPaperAirplane(ctx, 50, planeRef.current.y, 1);
            // Score increment
            setScore((prevScore) => prevScore + 1);

            // Update pipes and check for collisions
            let pipes = pipesRef.current;
            pipes = pipes.map((pipe) => ({
                ...pipe,
                x: pipe.x - pipeSpeed,
            }));

            pipes.forEach((pipe) => {
                // Draw top and bottom pipes
                ctx.fillStyle = "#4354f1";
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
                    (planeRef.current.y < pipe.gap || planeRef.current.y > pipeBottom)
                ) {
                    handleGameOver();
                    return;
                }
            });

            // Remove off-screen pipes and add new pipes
            if (pipes[0]?.x + pipeWidth < 0) {
                pipes.shift();
                pipes.push({
                    x: screenWidth + (screenWidth / 2),
                    gap: Math.random() * (screenHeight * 0.4) + (screenHeight * 0.1),
                });
            }

            pipesRef.current = pipes;

            // Draw score
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`Score: ${score}`, 10, 20);

            frameRef.current = requestAnimationFrame(render);
        };

        if (gameState === "RUNNING") {
            frameRef.current = requestAnimationFrame(render);
        }

        return () => {
            if (typeof frameRef.current === 'number') {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [gameState, score, screenWidth, screenHeight]);

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
        <div ref={canvasWrapperRef}
             className="w-full h-full"
             onMouseDown={handleFlap}
             onTouchStart={handleFlap}
        >
            {gameState === "RUNNING" && <canvas ref={canvasRef} width={screenWidth} height={screenHeight}/>}
            {gameState === "NOT_STARTED" && (
                <div className="text-2xl text-red-600">
                    Tap or press space to start! <br/>
                </div>
            )}
            {gameState === "GAME_OVER" && (
                <div className="text-2xl text-red-600">
                    Game Over! Score: {score} <br/>
                    Tap or press space to restart! <br/>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
