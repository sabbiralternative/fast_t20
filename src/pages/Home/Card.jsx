import { useEffect } from "react";
import {
  playerOneFirstCard,
  playerOneSecondCard,
  playerOneThirdCard,
  playerTwoFirstCard,
  playerTwoSecondCard,
  playerTwoThirdCard,
} from "../../static";
import { playCardSound } from "../../utils/sound";
import SingleCard from "./SingleCard";

const Card = ({
  styleIndex,
  setStyleIndex,
  showCardAnimation,
  winCard,
  isAnimationEnd,
  totalWinAmount,
  multiplier,
}) => {
  const cardSequence = [
    { key: "playerOneFirstCard", delay: 200, sound: false },
    { key: "playerTwoFirstCard", delay: 400, sound: true },
    { key: "playerOneSecondCard", delay: 400, sound: true },
    { key: "playerTwoSecondCard", delay: 400, sound: true },
    { key: "playerOneThirdCard", delay: 400, sound: true },
    { key: "playerTwoThirdCard", delay: 400, sound: true },
  ];

  useEffect(() => {
    if (!showCardAnimation) return;

    for (const { key, delay, sound } of cardSequence) {
      if (styleIndex?.[key] <= 0) {
        const timer = setTimeout(() => {
          if (sound) playCardSound();
          setStyleIndex((prev) => ({
            ...prev,
            [key]: prev[key] + 1,
          }));
        }, delay);
        return () => clearTimeout(timer); // exit early after one update
      }
    }
  }, [styleIndex, setStyleIndex, showCardAnimation]);

  const cardsToRender = [
    {
      player: "B",
      id: "playerTwoThirdCard",
      style: playerTwoThirdCard[styleIndex?.playerTwoThirdCard],
      card: winCard?.card_b?.[2],
      highlight: winCard.winner && isAnimationEnd,
    },
    {
      player: "A",
      id: "playerOneThirdCard",
      style: playerOneThirdCard[styleIndex?.playerOneThirdCard],
      card: winCard?.card_a?.[2],
      highlight: winCard.winner && isAnimationEnd,
    },
    {
      player: "B",
      id: "playerTwoSecondCard",
      style: playerTwoSecondCard[styleIndex?.playerTwoSecondCard],
      card: winCard?.card_b?.[1],
      highlight: winCard.winner && isAnimationEnd,
    },
    {
      player: "A",
      id: "playerOneSecondCard",
      style: playerOneSecondCard[styleIndex?.playerOneSecondCard],
      card: winCard?.card_a?.[1],
      highlight: winCard.winner && isAnimationEnd,
    },
    {
      player: "B",
      id: "playerTwoFirstCard",
      style: playerTwoFirstCard[styleIndex?.playerTwoFirstCard],
      card: winCard?.card_b?.[0],
      highlight: winCard.winner && isAnimationEnd,
    },
    {
      player: "A",
      id: "playerOneFirstCard",
      style: playerOneFirstCard[styleIndex?.playerOneFirstCard],
      card: winCard?.card_a?.[0],
      highlight: winCard.winner && isAnimationEnd,
    },
  ];

  return (
    <>
      {isAnimationEnd && totalWinAmount !== 0 && (
        <div
          style={{
            position: "absolute",
            transform: "translateY(-105%) translateZ(52px) translateX(50%)",
            right: "55%",
            top: "45%",
          }}
          className="flex flex-col items-center justify-center gap-1 px-2 py-1 border-2 rounded border-stakeGreen bg-zinc-800 animate__faster animate__zoomIn animate__animated z-50"
        >
          <div className="flex flex-col items-center justify-center font-mono">
            <span className="text-xl font-semibold tracking-tighter text-stakeGreen md:text-3xl">
              x{multiplier}
            </span>
            <div className="w-full h-0.5 bg-white/5" />
            <span className="text-sm font-semibold tracking-tighter text-stakeGreen/80 md:text-xl">
              <span>₹{totalWinAmount}</span>
            </span>
          </div>
        </div>
      )}

      {cardsToRender.map((card) => (
        <SingleCard
          key={card.id}
          style={card.style}
          card={card.card}
          highlight={card.highlight}
          player={card.player}
          winCard={winCard}
        />
      ))}
    </>
  );
};

export default Card;
