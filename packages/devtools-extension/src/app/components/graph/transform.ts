import { fromEvent, map, Subscription, switchMap, takeUntil } from "rxjs";

/**
 * Applies the transformation matrix to the svg.viewBox.
 * @param svg
 * @param matrix
 */
function applyMatrixToViewBox(svg: SVGSVGElement, matrix: DOMMatrix) {
  const vb = svg.viewBox.baseVal;
  const a = matrix.transformPoint({ x: vb.x, y: vb.y });
  const b = matrix.transformPoint({ x: vb.x + vb.width, y: vb.y + vb.height });

  vb.x = a.x;
  vb.y = a.y;
  vb.width = b.x - a.x;
  vb.height = b.y - a.y;
}

/**
 * Returns the effective svg viewbox.
 * The svg has the width: 100% and height: 100%,
 * so the effective viewbox might be different than the one defined by the viewBox attribute.
 * The effective viewbox is calculated by taking into account the actual space taken by the svg element.
 * @param svg
 * @param bb
 */
function getViewBox(svg: SVGSVGElement, bb: DOMRect) {
  const vb = svg.viewBox.baseVal;
  const vbh = Math.max((vb.width / bb.width) * bb.height, vb.height);
  const vbw = Math.max((vb.height / bb.height) * bb.width, vb.width);
  const vbx = vb.width < vbw ? vb.x - (vbw - vb.width) / 2 : vb.x;
  const vby = vb.height < vbh ? vb.y - (vbh - vb.height) / 2 : vb.y;

  return {
    x: vbx,
    y: vby,
    width: vbw,
    height: vbh,
  };
}

function getBoundingBox(svg: SVGSVGElement) {
  return svg.getBoundingClientRect();
}

function identityMatrix() {
  return new DOMMatrix([1, 0, 0, 1, 0, 0]);
}

export function initPanAndZoom(svg: SVGSVGElement) {
  const subscription = new Subscription();

  subscription.add(
    fromEvent<WheelEvent>(svg, 'wheel').subscribe((e) => {
      const d = e.deltaY / 25;
      const scale =
        d < 0
          ? 1 + 0.25 * (1 - 1 / (1 - d))
          : d > 0
          ? 1 - 0.2 * (1 - 1 / (1 + d))
          : 1;

      const bb = getBoundingBox(svg);
      const vb = getViewBox(svg, bb);
      const cx = vb.x + (vb.width * (e.clientX - bb.x)) / bb.width;
      const cy = vb.y + (vb.height * (e.clientY - bb.y)) / bb.height;

      const matrix = identityMatrix()
        .scaleSelf(scale, scale, 1, cx, cy, 0)
        .invertSelf();

      applyMatrixToViewBox(svg, matrix);
    })
  );

  subscription.add(
    fromEvent(svg, 'mousedown')
      .pipe(
        switchMap(() => {
          return fromEvent<MouseEvent>(document, 'mousemove').pipe(
            takeUntil(fromEvent(document, 'mouseup')),
            map((e) => {
              e.preventDefault();
              const { movementX, movementY } = e;
              return { movementX, movementY };
            })
          );
        })
      )
      .subscribe(({ movementX, movementY }) => {
        const bb = getBoundingBox(svg);
        const vb = getViewBox(svg, bb);
        const mx = (movementX * vb.width) / bb.width;
        const my = (movementY * vb.height) / bb.height;

        const matrix = identityMatrix().translateSelf(mx, my).invertSelf();

        applyMatrixToViewBox(svg, matrix);
      })
  );

  return subscription;
}
