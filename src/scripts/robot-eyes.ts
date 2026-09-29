/** How far a pupil may move from the centre of its eye, in SVG units. */
const MAX_OFFSET = 4.5;
/** Pointer distance, in pixels, at which the pupils reach the edge of the eye. */
const FULL_DISTANCE = 160;

/** Makes the robot's pupils follow the pointer. Skipped for touch and reduced motion. */
export function initRobot(): void {
  const robot = document.querySelector<SVGSVGElement>('[data-robot]');
  if (!robot) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const eyes = [...robot.querySelectorAll<SVGGElement>('[data-eye]')].flatMap((eye) => {
    const socket = eye.querySelector<SVGCircleElement>('[data-socket]');
    const pupil = eye.querySelector<SVGCircleElement>('[data-pupil]');
    return socket && pupil ? [{ socket, pupil }] : [];
  });
  if (eyes.length === 0) return;

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const update = () => {
    frame = 0;
    for (const { socket, pupil } of eyes) {
      const box = socket.getBoundingClientRect();
      const dx = pointerX - (box.left + box.width / 2);
      const dy = pointerY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance === 0) continue;
      const reach = Math.min(1, distance / FULL_DISTANCE) * MAX_OFFSET;
      const x = (dx / distance) * reach;
      const y = (dy / distance) * reach;
      pupil.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame === 0) frame = window.requestAnimationFrame(update);
    },
    { passive: true },
  );
}
