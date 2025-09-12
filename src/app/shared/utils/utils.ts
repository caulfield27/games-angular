import confetti from "canvas-confetti";

export function launchConfetti(duration: number) {
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff8a4b", "#cb9df0", "#f6dfff", "#ffb86c"]
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff8a4b", "#cb9df0", "#f6dfff", "#ffb86c"]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}