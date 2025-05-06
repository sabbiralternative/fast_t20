import { useSelector } from "react-redux";
import { useOrderMutation } from "../../redux/features/events/events";
import { useEffect } from "react";
import { Status } from "../../const";
import Stake from "../../components/shared/Stake/Stake";
import { playStakeChangeSound } from "../../utils/sound";

const BetSlip = ({
  data,
  setAnimation,
  setStakeState,
  status,
  initialState,
  stakeState,
  setShowWinLossResult,
  setTotalWinAmount,
  setToast,
  animation,
  double,
}) => {
  const [addOrder] = useOrderMutation();
  const { stake } = useSelector((state) => state.global);

  // Generic function to update stake state
  const handleStakeChange = (payload) => {
    playStakeChangeSound();
    const { key, data, dataIndex, runnerIndex, type } = payload;
    setAnimation([key]);
    const formatData = {
      marketId: data?.[dataIndex]?.id,
      roundId: data?.[dataIndex]?.roundId,
      name: data?.[dataIndex]?.name,
      eventId: data?.[dataIndex]?.eventId,
      eventName: data?.[dataIndex]?.eventName,
      selection_id: data?.[dataIndex]?.runners?.[runnerIndex]?.id,
      runner_name: data?.[dataIndex]?.runners?.[runnerIndex]?.name,
      isback: type === "back" ? 0 : 1,
      event_id: data?.[dataIndex]?.eventId,
      event_type_id: data?.[dataIndex]?.event_type_id,
      price: data?.[dataIndex]?.runners?.[runnerIndex]?.[type]?.[0]?.price,
    };
    const timeout = setTimeout(() => {
      setAnimation([]);
      setStakeState((prev) => {
        const maxSerial = Math.max(
          0,
          ...Object.values(prev)
            .map((item) => item.serial)
            .filter((serial) => serial !== undefined)
        );

        return {
          ...prev,
          [key]: {
            roundId: formatData?.roundId,
            name: formatData?.name,
            eventId: formatData?.eventId,
            eventName: formatData?.eventName,
            show: true,
            animation: false,
            stake: prev?.[key]?.show
              ? prev[key].stake + prev[key].actionBy
              : prev?.[key]?.stake,
            marketId: formatData?.marketId,
            selection_id: formatData?.selection_id,
            price: formatData?.price,
            runner_name: formatData?.runner_name,
            isback: formatData?.isback,
            serial: prev[key]?.serial ? prev[key]?.serial : maxSerial + 1,
            actionBy: stake,
            undo: [...(prev[key]?.undo || []), stake],
          },
        };
      });
    }, 500);

    return () => clearTimeout(timeout);
  };

  // Reset state when status is OPEN
  useEffect(() => {
    if (status === Status.OPEN) {
      setStakeState(initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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

  useEffect(() => {
    const filterPlacedBet = Object.values(stakeState).filter((bet) => bet.show);
    let payload = filterPlacedBet.map((bet) => ({
      roundId: bet?.roundId,
      name: bet?.name,
      eventId: bet?.eventId,
      eventName: bet?.eventName,
      marketId: bet?.marketId,
      selection_id: bet?.selection_id,
      runner_name: bet?.runner_name,
      stake: bet?.stake,
      isback: bet?.isback,
      price: bet?.price,
    }));

    if (status === Status.SUSPENDED && payload?.length > 0) {
      const handleOrder = async () => {
        const res = await addOrder(payload).unwrap();
        payload = [];
        if (res?.success) {
          setShowWinLossResult(false);
          setTotalWinAmount(null);
          let totalBets = [];

          for (let bet of filterPlacedBet) {
            totalBets.push({
              selection_id: bet.selection_id,
              price: bet?.price,
              eventId: bet?.eventId,
              marketId: bet?.marketId,
              name: bet?.name,
              stake: bet?.stake,
            });
          }
          localStorage.setItem("totalBetPlace", JSON.stringify(totalBets));

          setToast(res?.Message);
        }
      };
      handleOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOrder, status]);

  return (
    <div
      id="step-betOptions"
      className="grid gap-1.5 justify-items-center justify-center h-24 grid-flow-dense px-6 grid-cols-4 mx-auto max-w-md w-full p-2 min-h-[20%]"
      style={{ pointerEvents: "auto" }}
    >
      <div
        onClick={() =>
          handleStakeChange({
            key: "b",
            data,
            dataIndex: 0,
            runnerIndex: 1,
            type: "back",
          })
        }
        className="relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24   col-start-3 
        border-stakeGreen text-stakeGreen "
        style={{ pointerEvents: "auto" }}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-5xl">
          B
        </span>
        <span className="absolute text-white/20 font-mono bottom-0 text-[10px]">
          x1.98
        </span>
        <div className="relative w-10 h-10">
          <div
            className={`${
              animation.includes("b")
                ? "absolute top-0 visible transition-all duration-500 "
                : "absolute -top-16 invisible opacity-0"
            }  z-50`}
          >
            <Stake stake={double ? stakeState?.b?.stake : stake} />
          </div>

          {stakeState?.b?.show && <Stake stake={stakeState?.b?.stake} />}
        </div>
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "a",
            data,
            dataIndex: 0,
            runnerIndex: 0,
            type: "back",
          })
        }
        className="relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24  col-start-2 
        border-white/30 text-white/50 "
        style={{ pointerEvents: "auto" }}
      >
        <span className="absolute font-bold -translate-y-1/2 top-1/2 opacity-20 text-5xl">
          A
        </span>
        <span className="absolute text-white/20 font-mono bottom-0 text-[10px]">
          x1.98
        </span>
        <div className="relative w-10 h-10">
          <div
            className={`${
              animation.includes("a")
                ? "absolute top-0 visible transition-all duration-500 "
                : "absolute -top-16 invisible opacity-0"
            }  z-50`}
          >
            <Stake stake={double ? stakeState?.a?.stake : stake} />
          </div>

          {stakeState?.a?.show && <Stake stake={stakeState?.a?.stake} />}
        </div>
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "aPlus",
            data,
            dataIndex: 5,
            runnerIndex: 1,
            type: "back",
          })
        }
        className="relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24  col-start-1 
        border-white/30 text-white/50 "
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
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x2
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x5
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x7
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x26
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x36
          </span>
        </div>
        <div className="relative w-10 h-10">
          <div
            className={`${
              animation.includes("aPlus")
                ? "absolute top-0 visible transition-all duration-500 "
                : "absolute -top-16 invisible opacity-0"
            }  z-50`}
          >
            <Stake stake={double ? stakeState?.aPlus?.stake : stake} />
          </div>

          {stakeState?.aPlus?.show && (
            <Stake stake={stakeState?.aPlus?.stake} />
          )}
        </div>
      </div>
      <div
        onClick={() =>
          handleStakeChange({
            key: "bPlus",
            data,
            dataIndex: 2,
            runnerIndex: 0,
            type: "back",
          })
        }
        className="relative flex bg-black/10 rounded-lg w-full items-center  border-2   justify-center aspect-square h-20 lg:h-24   col-start-4 
        border-stakeGreen text-stakeGreen "
        style={{
          pointerEvents: "auto",
          borderColor: "rgb(0, 184, 231)",
          color: "rgb(0, 184, 231)",
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
            style={{ backgroundColor: "rgb(0, 184, 231)", width: "100%" }}
          >
            x2
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x5
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x7
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x26
          </span>
          <span
            className="px-0.5 font-mono font-medium text-center"
            style={{
              backgroundColor: "rgba(128, 128, 128, 0.5)",
              width: "100%",
            }}
          >
            x36
          </span>
        </div>
        <div className="relative w-10 h-10">
          <div
            className={`${
              animation.includes("bPlus")
                ? "absolute top-0 visible transition-all duration-500 "
                : "absolute -top-16 invisible opacity-0"
            }  z-50`}
          >
            <Stake stake={double ? stakeState?.bPlus?.stake : stake} />
          </div>

          {stakeState?.bPlus?.show && (
            <Stake stake={stakeState?.bPlus?.stake} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BetSlip;
