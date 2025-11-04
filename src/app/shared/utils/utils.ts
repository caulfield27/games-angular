import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

export function launchConfetti(duration: number) {
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff8a4b', '#cb9df0', '#f6dfff', '#ffb86c'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ff8a4b', '#cb9df0', '#f6dfff', '#ffb86c'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function copy(data: string) {
  navigator.clipboard
    .writeText(data)
    .then(() =>
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        text: 'Ссылка успешно скопирована!',
        showConfirmButton: false,
        timer: 1000,
      })
    )
    .catch(() =>
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        text: 'Не удалось скопировать ссылку.',
        showConfirmButton: false,
        timer: 1000,
      })
    );
}
