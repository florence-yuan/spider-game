import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "./GameEngine";
import Stats from "./Stats";
import MsgBoard from "./MsgBoard";

const canvasWidth = 1704;
const canvasHeight = 2100;

export default function App() {
	const viewRef = useRef(null);

	const canvasBgRef = useRef(null);
	const canvasBricksRef = useRef(null);
	const canvasCharRef = useRef(null);
	const canvasSpiderRef = useRef(null);

	const canvasRefs = [canvasBgRef, canvasBricksRef, canvasCharRef, canvasSpiderRef];

	const engineRef = useRef(null);
	const spiderRef = useRef(null);

	const defaultState = useRef({
		type: 'ongoing',
		info: 'Game Over',
		numLives: 3,
		sceneID: 1
	});

	const [gameState, setGameState] = useState(defaultState.current);
	const [hasStarted, setStarted] = useState(false);

	function handleSceneTrans(type = 'lose-life') {
		defaultState.current.numLives = spiderRef.current.numLives;
		defaultState.current.sceneID = engineRef.current.sceneID;

		setTimeout(() => {
			setGameState({
				type: 'next-scene',
				numLives: spiderRef.current.numLives,
				sceneID: engineRef.current.sceneID
			});

			if (type === 'next-scene') {
				startGame(true);
			}
	
			setTimeout(() => {
				setGameState({
					type: 'ongoing',
				});
			}, 3000);
		}, type === 'lose-life' ? 3500 : 0);
	}

	function handleGameOver(type = 'lives-up') {
		setTimeout(() => {
			setGameState({
				type: 'game-over',
				info: type === 'lives-up' ? 'Game Over' : "Time's Up"
			});
		}, type === 'lives-up' ? 3500 : 0);
	}

	const handleKeydown = useCallback((e) => {
		if (!spiderRef.current)
			return;

		spiderRef.current.setKeyPresses(e.key, true);
	}, []);

	const handleKeyup = useCallback((e) => {
		if (!spiderRef.current)
			return;

		spiderRef.current.setKeyPresses(e.key, false);
	}, []);

	const genGame = useCallback((clearPrev = false) => {
		if (clearPrev) {
			viewRef.current.style.transform = `translateX(-50%)`;
			for (let cref of canvasRefs) {
				cref.current.getContext('2d').clearRect(0, 0, canvasWidth, canvasHeight);
			}
		}

		const engine = new GameEngine(
			canvasBgRef.current.getContext('2d'),
			canvasBricksRef.current.getContext('2d'),
			canvasCharRef.current.getContext('2d'),
			canvasSpiderRef.current.getContext('2d'),
			canvasWidth,
			canvasHeight,
			10,
		);
		engineRef.current = engine;
		
		engine.paintGame();
		engine.handleMsg = {
			sceneTrans: handleSceneTrans,
			gameOver: handleGameOver
		};

		const spider = engine.getSpider();
		spiderRef.current = spider;
	}, []);

	function startGame(clearPrev = false){
		genGame(clearPrev);
		engineRef.current.startGame();
	}

	useEffect(() => {
		if (engineRef.current) {
			return;
		}
		
		genGame();

		window.addEventListener("keydown", handleKeydown);
		window.addEventListener("keyup", handleKeyup);

		return function cleanup() {
			if (engineRef.current)
				return;
			window.removeEventListener("keydown", handleKeydown);
			window.removeEventListener("keyup", handleKeyup);
		}
	}, []);

	return (
		<>
			<Stats
				gameState={gameState.type}
				handleGameOver={() => {engineRef.current.resetGame('time-up')}}
				hasStarted={hasStarted}
			/>
			<div
				className="game-view"
				ref={viewRef}
				style={{
					transform: `translateX(-50%) translateY(0)`
				}}
			>
				{canvasRefs.map((canvasRef, i) => {
					return (
						<canvas
							key={i}
							ref={canvasRef}
							width={canvasWidth}
							height={canvasHeight}
						></canvas>
					)
				})}
			</div>
			<MsgBoard
				msg={gameState}
				setMsg={setGameState}
				startGame={startGame}
				defaultState={defaultState}
			/>
			{!hasStarted && <div className="modal">
				<div className="modal__dirs">
					Help the spider reach the top floor of the infinity hotel using <code>a</code> and <code>d</code> to move horizontally and <code>k</code> to jump.
					Be careful to avoid the guest clones!
				</div>
				<button
					className="start-game"
					onClick={() => {
						if (!engineRef.current)
							return;

						engineRef.current.startGame();
						setStarted(true);
					}}
				>
					Start Game
				</button>
			</div>}										
		</>
	);
}