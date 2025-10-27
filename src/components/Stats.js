import { useState, useEffect } from "react"

export default function Stats({gameState, handleGameOver, hasStarted}) {
	const [timeleft, setTimeLeft] = useState(100);

	useEffect(() => {
		if (!hasStarted || gameState !== 'ongoing') {
			setTimeLeft(100);
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(timer);
					console.log("!!!TIME'S UP!!!");
					handleGameOver('time-up');
				}
				return prev - 1;
			})
		}, 1000);

		return () => {
			console.log("clear timer")
			clearInterval(timer);
		}
	}, [gameState, hasStarted]);

    return (
        <div className="stats">
            <div className="stats__panel">
                <div className="panel__label">Time</div>
                <div className="panel__num">{timeleft}</div>
            </div>
        </div>
    )
}