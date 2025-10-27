export default function MsgBoard({msg, setMsg, genGame, defaultState}) {
    if (msg.type === 'ongoing') {
        return null;
    }

    return (
        <div className="msg-board">
            {
                msg.type === 'game-over' ? (
                    <>
                        <div className="msg__banner banner--restart">
                            {msg.info}
                        </div>
                        <button
                            className="msg__btn"
                            onClick={() => {
                                genGame(true);
                                setMsg(defaultState.current);
                            }}
                        >
                            Play again
                        </button>
                    </>
                ) : (
                    <>
                        <div className="msg__banner banner--info">
                            <span>Lives: {msg.numLives}</span>
                            <span>Scene: {msg.sceneID}</span>
                        </div>
                    </>
                )
            }
        </div>
    )
}