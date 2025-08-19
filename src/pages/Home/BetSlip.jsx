import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { playStakeChangeSound } from "../../utils/sound";
import StakeAnimation from "./StakeAnimation";
import { Winner, WinnerAPlus } from "../../const";
import Lock from "../../assets/Icon/Lock";

const BetSlip = ({
  setShowTotalWinAmount,
  setAnimation,
  setStakeState,
  stakeState,
  animation,
  double,
  winCard,
  setIsAnimationEnd,
  isAnimationEnd,
}) => {
  const [loading, setLoading] = useState(false);
  const { stake } = useSelector((state) => state.global);

  const handleStakeChange = (payload) => {
    setLoading(true);
    setShowTotalWinAmount(false);
    setIsAnimationEnd(false);
    playStakeChangeSound();
    const { key } = payload;
    setAnimation([key]);
    const formatData = {
      eventId: 30003,
      eventName: "Fast Teen Patti T20",
      isback: 0,
      runner_name: payload.runner_name,
      price: payload.price,
      stake: payload.stake,
    };
    const timeout = setTimeout(() => {
      setAnimation([]);
      setStakeState((prev) => {
        const allStake = { ...prev };
        const maxSerial = Math.max(
          0,
          ...Object.values(prev)
            .map((item) => item.serial)
            .filter((serial) => serial !== undefined)
        );
        if (key === "A") {
          allStake.B.lock = true;
        }
        if (key === "B") {
          allStake.A.lock = true;
        }
        return {
          ...allStake,
          [key]: {
            eventId: formatData.eventId,
            eventName: formatData.eventName,
            isback: formatData.isback,
            runner_name: formatData.runner_name,
            price: formatData.price,
            show: true,
            animation: false,
            stake: prev[key].show
              ? prev[key].stake + prev[key].actionBy
              : prev[key].stake,
            serial: prev[key]?.serial ? prev[key]?.serial : maxSerial + 1,
            actionBy: stake,
            undo: [...(prev[key]?.undo || []), stake],
          },
        };
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    setStakeState((prev) => {
      const updatedState = {};
      for (const key in prev) {
        updatedState[key] = {
          ...prev[key],
          stake: prev[key].show ? prev[key].stake : stake,
          actionBy: stake,
        };
      }
      return updatedState;
    });
  }, [stake]); // Runs when stake value changes

  return (
    <div
      id="step-betOptions"
      className="grid gap-1.5 justify-items-center justify-center h-24 grid-flow-dense px-6 grid-cols-4 mx-auto max-w-md w-full p-2 min-h-[20%]"
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
      <div
        onClick={() =>
          handleStakeChange({
            key: "B",
            runner_name: "B",
            price: 1.98,
          })
        }
        className={`relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24   col-start-3 
         ${
           winCard?.winner === Winner.B && isAnimationEnd
             ? "border-stakeGreen text-stakeGreen"
             : "border-white/30 text-white/50"
         } ${stakeState?.B?.lock ? "pointer-events-none" : "cursor-pointer"}`}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-5xl">
          B
        </span>
        {stakeState?.B?.lock && <Lock />}
        <span className="absolute text-white/20 font-mono bottom-0 text-[10px]">
          x1.98
        </span>
        <StakeAnimation
          animation={animation}
          double={double}
          runner={"B"}
          stake={stake}
          stakeState={stakeState}
        />
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "A",
            runner_name: "A",
            price: 1.98,
          })
        }
        className={`relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24  col-start-2 
         ${
           winCard?.winner === Winner.A && isAnimationEnd
             ? "border-stakeGreen text-stakeGreen"
             : "border-white/30 text-white/50"
         } ${stakeState?.A?.lock ? "pointer-events-none" : "cursor-pointer"}`}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-5xl">
          A
        </span>
        {stakeState?.A?.lock && <Lock />}
        <span className="absolute text-white/20 font-mono bottom-0 text-[10px]">
          x1.98
        </span>
        <StakeAnimation
          animation={animation}
          double={double}
          runner={"A"}
          stake={stake}
          stakeState={stakeState}
        />
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "APLUS",
            runner_name: "APLUS",
            price: null,
          })
        }
        className={`relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24  col-start-1 
         ${
           winCard?.winner_aplus !== null && isAnimationEnd
             ? "border-purple text-purple"
             : "border-white/30 text-white/50"
         }`}
        style={{ pointerEvents: "auto" }}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-4xl">
          A+
        </span>
        <div
          className="absolute overflow-clip flex flex-col-reverse items-center gap-[1px] text-[9px] lg:text-xs text-black"
          style={{
            left: "2px",
            transform: "translateX(-124%)",
            borderRadius: "4px 0px 0px 4px",
          }}
        >
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_aplus === WinnerAPlus.PAIR && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x2
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_aplus === WinnerAPlus.COLOR && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x5
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_aplus === WinnerAPlus.STRAIGHT && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x7
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_aplus === WinnerAPlus.TRIO && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x26
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_aplus === WinnerAPlus.STRAIGHTFLUSH &&
                isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x36
          </span>
        </div>
        <StakeAnimation
          animation={animation}
          double={double}
          runner={"APLUS"}
          stake={stake}
          stakeState={stakeState}
        />
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "BPLUS",
            runner_name: "BPLUS",
            price: null,
          })
        }
        className={`relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24   col-start-4 
         ${
           winCard?.winner_bplus !== null && isAnimationEnd
             ? "border-purple text-purple"
             : "border-white/30 text-white/50"
         }`}
        style={{
          pointerEvents: "auto",
        }}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-4xl">
          B+
        </span>
        <div
          className="absolute overflow-clip flex flex-col-reverse items-center gap-[1px] text-[9px] lg:text-xs text-black"
          style={{
            right: "2px",
            transform: "translateX(124%)",
            borderRadius: "0px 4px 4px 0px",
          }}
        >
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_bplus === WinnerAPlus.PAIR && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x2
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_bplus === WinnerAPlus.COLOR && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x5
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_bplus === WinnerAPlus.STRAIGHT && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x7
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_bplus === WinnerAPlus.TRIO && isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x26
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor:
                winCard?.winner_bplus === WinnerAPlus.STRAIGHTFLUSH &&
                isAnimationEnd
                  ? "rgb(0, 184, 231)"
                  : "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x36
          </span>
        </div>
        <StakeAnimation
          animation={animation}
          double={double}
          runner={"BPLUS"}
          stake={stake}
          stakeState={stakeState}
        />
      </div>
    </div>
  );
};

export default BetSlip;
