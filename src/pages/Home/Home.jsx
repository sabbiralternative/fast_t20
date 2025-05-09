import { useState } from "react";
import BetSlip from "./BetSlip";
import FiftyTwoCard from "./FiftyTwoCard";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { changeCardsProperty, fiftyTwoCard } from "../../static/fiftyTwoCard";
import { useSelector } from "react-redux";
import { useGetEventDetailsQuery } from "../../redux/features/events/events";
import { playStakeChangeSound, playUndoSound } from "../../utils/sound";

const Home = () => {
  const [double, setDouble] = useState(false);
  const [animation, setAnimation] = useState([]);
  const [showWinLossResult, setShowWinLossResult] = useState(false);
  const [totalWinAmount, setTotalWinAmount] = useState(null);
  const [toast, setToast] = useState(null);
  const { data } = useGetEventDetailsQuery(
    { eventTypeId: 1000, eventId: 10017 },
    { pollingInterval: 1000 }
  );
  const firstEvent = data?.result?.[0];
  const { stake } = useSelector((state) => state.global);
  const [cards, setCards] = useState(fiftyTwoCard);
  const [showAnimationBtn, setShowAnimationBtn] = useState(false);
  const initialState = {
    a: { show: false, stake },
    aPlus: { show: false, stake },
    b: { show: false, stake },
    bPlus: { show: false, stake },
  };
  const [stakeState, setStakeState] = useState(initialState);

  const handleClick = () => {
    setShowAnimationBtn(true);
    let steps = 0;
    const totalSteps = 6;

    const updateCards = (step) => {
      if (step === 6) {
        setCards(fiftyTwoCard);
        setShowAnimationBtn(false);
      } else {
        const newCards = cards.map((card, i) => {
          return {
            ...card,
            right: changeCardsProperty[i + 1][step]?.right,
            translateZ: changeCardsProperty[i + 1][step]?.translateZ,
            delay: changeCardsProperty[i + 1][step]?.delay,
          };
        });
        setCards(newCards);
      }
    };

    const interval = setInterval(() => {
      if (steps <= totalSteps) {
        updateCards(steps);
        steps++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  };

  const handleUndoStake = () => {
    playUndoSound();
    setStakeState((prev) => {
      const updatedState = { ...prev };
      const prevValues = Object.entries(prev);
      const isPlacedDouble = Object.values(stakeState).filter(
        (item) => item?.double
      );

      if (isPlacedDouble?.length > 0) {
        Object.keys(updatedState).forEach((key) => {
          if (updatedState[key].show) {
            updatedState[key] = {
              ...updatedState[key],
              stake: updatedState[key].stake / 2,
              double: updatedState[key].double - 1,
            };
          }
        });

        return updatedState;
      } else {
        const maxSerialObject = prevValues.reduce(
          (maxObj, [key, currentObj]) => {
            if (currentObj.serial > (maxObj?.serial || 0)) {
              return { key, obj: currentObj };
            }
            return maxObj;
          },
          {}
        );

        if (maxSerialObject.obj) {
          const updatedObj = {
            ...maxSerialObject.obj,
            undo: [...maxSerialObject.obj.undo],
          };

          if (
            updatedObj.undo.length > 0 &&
            updatedObj.stake > updatedObj.undo[updatedObj.undo.length - 1]
          ) {
            updatedObj.stake -= updatedObj.undo.pop();
          } else {
            updatedObj.show = false;
            delete updatedObj.serial;
          }

          return {
            ...prev,
            [maxSerialObject.key]: updatedObj,
          };
        }

        return prev;
      }
    });
  };
  const handleDoubleStake = () => {
    setDouble(true);
    playStakeChangeSound();
    setStakeState((prevState) => {
      const updatedState = { ...prevState };
      const maxSerial = Math.max(
        0,
        ...Object.values(updatedState)
          .map((item) => item.serial)
          .filter((serial) => serial !== undefined)
      );

      const oddNames = [];

      Object.keys(updatedState).forEach((key) => {
        if (updatedState[key].show) {
          oddNames.push(key);
        }
      });
      setAnimation(oddNames);

      setTimeout(() => {
        Object.keys(updatedState).forEach((key) => {
          if (updatedState[key].show) {
            const currentStake = updatedState[key].stake;
            updatedState[key] = {
              ...updatedState[key],
              undo: [...updatedState[key].undo, currentStake],
              serial: updatedState[key]?.serial
                ? updatedState[key]?.serial
                : maxSerial + 1,
              stake: updatedState[key].stake * 2,
              double: updatedState[key].double
                ? updatedState[key].double + 1
                : 1,
            };
          }
        });

        setDouble(false);
        setAnimation([]);
      }, 500);

      return updatedState;
    });
  };

  return (
    <main className="flex flex-col items-center lg:h-screen bg-zinc-800">
      <div className="react-joyride" />
      <Header />
      <div className="flex flex-col flex-grow w-full lg:overflow-y-auto lg:flex-row-reverse bg-zinc-800">
        <div
          id="virtual-games-container"
          className="relative w-full px-2 h-fit overflow-clip lg:h-full"
        >
          {/* result winning start  */}
          {/* <div class="absolute -translate-x-1/2 w-fit top-20 left-1/2" style="z-index: 1000;"><div class="flex flex-col items-center justify-center gap-1 px-2 py-1 border-2 rounded border-stakeGreen bg-zinc-800 animate__faster animate__zoomIn animate__animated "><div class="flex flex-col items-center justify-center font-mono"><span class="text-xl font-semibold tracking-tighter text-stakeGreen md:text-3xl">x1.98</span><div class="w-full h-0.5 bg-white/5"></div><span class="text-sm font-semibold tracking-tighter text-stakeGreen/80 md:text-xl"><span>₹99.00</span></span></div></div></div> */}
          {/* result winning end  */}
          <div className="flex items-center w-full gap-2 text-white">
            {/* <div id="step-gameHistory"
                          class="flex items-center text-xs  justify-start gap-1 flex-grow max-w-xl min-w-12  overflow-x-auto text-zinc-500 whitespace-nowrap"
                          style="mask-image: linear-gradient(to right, black 0%, black 80%, transparent);"><span
                              class="px-3 py-1 border border-transparent rounded-full font-semibold bg-white/5 z-50">History</span>
                      </div>
                       */}
            <div
              id="step-gameHistory"
              className="flex items-center text-xs justify-start gap-1 flex-grow max-w-xl min-w-12 overflow-x-auto text-zinc-500 whitespace-nowrap"
              style={{
                maskImage:
                  "linear-gradient(to right,black 0%,black 80%,transparent )",
              }}
            >
              <span
                className="px-3 py-1  animate__animated rounded-full border border-transparent  cursor-pointer font-semibold bg-white/5 hover:border-white/10
                 
                 z-50 
                  
                  "
              >
                Player B
              </span>
            </div>
            <button className="ml-auto disabled:opacity-50 text-white/50 active:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className>
              <svg
                className="w-5 h-5 text-white/50"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 19l16 0" />
                <path d="M4 15l4 -6l4 2l4 -5l4 4" />
              </svg>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-5 h-5"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
            </div>
            <button className="disabled:opacity-50 text-white/50 active:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button disabled className="disabled:opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-5 h-5 text-white/50"
              >
                <path
                  fillRule="evenodd"
                  d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <main className="relative flex flex-col w-full gap-1 p-2 overflow-hidden rounded lg:h-full h-fit bg-black/20">
            <div className="absolute top-1 left-1 rounded overflow-clip grid grid-cols-2 gap-0.5 text-[9px] lg:text-xs text-white/30">
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(0, 231, 0)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>WINNER</span>
                <span className="ml-auto font-mono">x1.98</span>
              </span>
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(0, 184, 231)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>PAIR</span>
                <span className="ml-auto font-mono">x2</span>
              </span>
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(121, 33, 255)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>COLOR</span>
                <span className="ml-auto font-mono">x5</span>
              </span>
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(231, 0, 92)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>STRAIGHT</span>
                <span className="ml-auto font-mono">x7</span>
              </span>
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(231, 115, 0)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>TRIO</span>
                <span className="ml-auto font-mono">x26</span>
              </span>
              <span className="flex items-center gap-1  bg-white/5 py-0.5 px-1">
                <span
                  style={{
                    backgroundColor: "rgb(231, 184, 0)",
                    height: "8px",
                    width: "8px",
                    borderRadius: "100%",
                  }}
                />
                <span>STRAIGHT FLUSH</span>
                <span className="ml-auto font-mono">x36</span>
              </span>
            </div>

            <FiftyTwoCard cards={cards} />
            <BetSlip
              initialState={initialState}
              setAnimation={setAnimation}
              setShowWinLossResult={setShowWinLossResult}
              setStakeState={setStakeState}
              setToast={setToast}
              setTotalWinAmount={setTotalWinAmount}
              stakeState={stakeState}
              data={data?.result}
              status={firstEvent?.status}
              animation={animation}
              double={double}
            />
          </main>
          <div
            className="fixed top-0 left-0 w-dvw h-dvh lg:w-full lg:h-full lg:absolute"
            style={{ zIndex: 1000, pointerEvents: "none" }}
          >
            <div
              className="flex flex-col border rounded border-white/5 w-36 lg:w-64 bg-zinc-800"
              style={{
                position: "absolute",
                zIndex: 1000,
                left: "4px",
                top: "4px",
                cursor: "grab",
                pointerEvents: "none",
                userSelect: "none",
                touchAction: "none",
                opacity: 0,
              }}
            >
              <div className="flex items-center justify-between w-full p-1 bg-black/20">
                <span className="text-xs font-medium text-zinc-300">
                  Live Statistics
                </span>
                <button className="z-50 text-xs font-medium text-zinc-500 disabled:opacity-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col w-full gap-1">
                <div className="grid w-full gap-0.5 grid-cols-2 p-1">
                  <div className="flex flex-col px-1 rounded bg-black/10">
                    <span className="text-[10px] text-zinc-500">Wagered</span>
                    <span className="text-xs font-mono text-zinc-200">0</span>
                  </div>
                  <div className="flex flex-col px-1 rounded bg-black/10">
                    <span className="text-[10px] text-zinc-500">Profit</span>
                    <div className="flex items-center gap-1 font-mono text-zinc-700">
                      <span className="text-xs text-red">0.00</span>
                    </div>
                  </div>
                  <div className="flex flex-col px-1 rounded bg-black/10">
                    <span className="text-[10px] text-zinc-500">Wins</span>
                    <span className="text-xs font-mono text-zinc-500">0</span>
                  </div>
                  <div className="flex flex-col px-1 rounded bg-black/10">
                    <span className="text-[10px] text-zinc-500">Losses</span>
                    <span className="text-xs font-mono text-zinc-500">0</span>
                  </div>
                </div>
                <div
                  className="relative w-full rounded cursor-pointer bg-zinc-900"
                  style={{ zIndex: 1000 }}
                >
                  <span className="absolute text-[8px] top-1 left-1 text-white/40">
                    0 bets
                  </span>
                  <div className="w-full aspect-[2]">
                    <canvas className="w-full h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Sidebar
          handleUndoStake={handleUndoStake}
          handleDoubleStake={handleDoubleStake}
          setStakeState={setStakeState}
          initialState={initialState}
          showAnimationBtn={showAnimationBtn}
          handleClick={handleClick}
        />
      </div>
    </main>
  );
};

export default Home;
