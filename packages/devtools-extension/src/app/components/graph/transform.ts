import { fromEvent, map, Subscription, switchMap, takeUntil } from 'rxjs';

function setMatrix(g: SVGGElement, matrix: DOMMatrix) {
  g.setAttributeNS(
    null,
    'transform',
    `matrix(${[matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].join(
      ' '
    )})`
  );
}

function getViewBox(svg: SVGSVGElement, matrix: DOMMatrix, bb: DOMRect) {
  const vb = svg.viewBox.baseVal;
  const vbh = Math.max((vb.width / bb.width) * bb.height, vb.height);
  const vbw = Math.max((vb.height / bb.height) * bb.width, vb.width);
  const vbx = vb.width < vbw ? vb.x - (vbw - vb.width) / 2 : vb.x;
  const vby = vb.height < vbh ? vb.y - (vbh - vb.height) / 2 : vb.y;
  const imatrix = matrix.inverse();
  const a = imatrix.transformPoint({ x: vbx, y: vby });
  const b = imatrix.transformPoint({ x: vbx + vbw, y: vby + vbh });

  return {
    x: a.x,
    y: a.y,
    width: b.x - a.x,
    height: b.y - a.y,
  };
}

function getBoundingBox(svg: SVGSVGElement) {
  return svg.getBoundingClientRect();
}

export function initPanAndZoom(svg: SVGSVGElement, g: SVGGElement) {
  const subscription = new Subscription();
  const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
  setMatrix(g, matrix);

  subscription.add(
    fromEvent<WheelEvent>(svg, 'wheel').subscribe((e) => {
      const scale = e.deltaY < 0 ? 1.25 : 0.8;
      const bb = getBoundingBox(svg);
      const vb = getViewBox(svg, matrix, bb);
      const cx = vb.x + (vb.width * (e.clientX - bb.x)) / bb.width;
      const cy = vb.y + (vb.height * (e.clientY - bb.y)) / bb.height;

      matrix.scaleSelf(scale, scale, 1, cx, cy, 0);

      setMatrix(g, matrix);
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
        const vb = getViewBox(svg, matrix, bb);
        const mx = (movementX * vb.width) / bb.width;
        const my = (movementY * vb.height) / bb.height;

        matrix.translateSelf(mx, my);

        setMatrix(g, matrix);
      })
  );
}
