import { PenType } from '.';
import { Point } from '../point';
import { calcCenter, getRect, Rect, rectToPoints } from '../rect';
import { TopologyStore } from '../store';
import { deepClone } from '../utils';
import { Pen } from './model';

export function calcAnchorDock(e: Point, anchor: Point, store: TopologyStore) {
  let xDock: Point;
  let yDock: Point;
  let x = Infinity;
  let y = Infinity;
  const size = 8;
  for (const pen of store.data.pens) {
    if (pen.calculative.inView === false) {
      continue;
    }

    // 得到图形的全部点
    const points = getPointsByPen(pen);
    points.forEach((pt) => {
      if (pt === anchor) {
        return;
      }

      const disX = Math.abs(pt.x - e.x);
      if (disX < size && disX < x) {
        xDock = {
          x: Math.round(pt.x) + 0.5,
          y: Math.round(pt.y) + 0.5,
          prev: {
            x: Math.round(anchor.x) + 0.5,
            y: Math.round(anchor.y) + 0.5,
          },
        };
        x = disX;
      }
      const disY = Math.abs(pt.y - e.y);
      if (disY < size && disY < y) {
        yDock = {
          x: Math.round(pt.x) + 0.5,
          y: Math.round(pt.y) + 0.5,
          prev: {
            x: Math.round(anchor.x) + 0.5,
            y: Math.round(anchor.y) + 0.5,
          },
        };
        y = disY;
      }
    });
  }

  return {
    xDock,
    yDock,
  };
}

// export function calcRectDock(store: TopologyStore, rect: Rect) {
//   let xDock: Point;
//   let yDock: Point;
//   let x = Infinity;
//   let y = Infinity;
//   const size = 8;
//   if (store.options.disableDockLine) {
//     return {
//       // undefined , 不画对齐线了
//       xDock,
//       yDock,
//     };
//   }
//   store.data.pens.forEach((pen) => {
//     if (pen.calculative.active || pen.calculative.inView === false) {
//       return;
//     }

//     if (store.active[0]?.connectedLines) {
//       for (const item of store.active[0].connectedLines) {
//         if (item.lineId === pen.id) {
//           return;
//         }
//       }
//     }

//     const r = pen.calculative.worldRect;
//     let step = r.x - rect.x;
//     let disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.ex - rect.x;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.ex) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     if (!r.center) {
//       r.center = {
//         x: r.x + r.width / 2,
//         y: r.y + r.height / 2,
//       };
//     }

//     step = r.center.x - rect.x;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.center.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.x - rect.center.x;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.center.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.ex - rect.center.x;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.ex) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.center.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.center.x - rect.center.x;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.center.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.center.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.x - rect.ex;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.ex) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.ex - rect.ex;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.ex) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step: r.ex - rect.ex,
//         prev: { x: Math.round(rect.ex) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.center.x - rect.ex;
//     disX = Math.abs(step);
//     if (disX < size && disX < x) {
//       xDock = {
//         x: Math.round(r.center.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step: r.center.x - rect.ex,
//         prev: { x: Math.round(rect.ex) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       x = disX;
//     }

//     step = r.y - rect.y;
//     let disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.ey - rect.y;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.ey) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.center.y - rect.y;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.center.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.y - rect.center.y;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.center.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.ey - rect.center.y;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.ey) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.center.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.center.y - rect.center.y;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.center.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.center.y) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.y - rect.ey;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.ey) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.ey - rect.ey;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.ey) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.ey) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }

//     step = r.center.y - rect.ey;
//     disY = Math.abs(step);
//     if (disY < size && disY < y) {
//       yDock = {
//         x: Math.round(r.x) + 0.5,
//         y: Math.round(r.center.y) + 0.5,
//         step,
//         prev: { x: Math.round(rect.x) + 0.5, y: Math.round(rect.ey) + 0.5 },
//         penId: pen.id
//       };
//       y = disY;
//     }
//   });

//   return {
//     xDock,
//     yDock,
//   };
// }

export function calcMoveDock(
  store: TopologyStore,
  rect: Rect,
  pens: Pen[],
  offset: Point
) {
  // 找到 points ，深拷贝一下，不影响原值
  let activePoints: Point[] = [];
  if (pens.length === 1) {
    activePoints = deepClone(getPointsByPen(pens[0]));
    activePoints.forEach((point) => {
      point.x += offset.x;
      point.y += offset.y;
    });
  } else {
    calcCenter(rect);
    activePoints = [rect.center, ...rectToPoints(rect)];
  }
  return calcDockByPoints(store, activePoints);
}

/**
 * 得到画笔的全部点
 * 线 即全部的 worldAnchors
 * 图形 即全部的 worldAnchors ，加上边缘四个点以及中心点
 * @param pen 画笔
 */
export function getPointsByPen(pen: Pen): Point[] {
  if (!pen.type) {
    const outerPoints = rectToPoints(pen.calculative.worldRect);
    calcCenter(pen.calculative.worldRect);
    return [
      ...outerPoints,
      ...pen.calculative.worldAnchors,
      pen.calculative.worldRect.center,
    ];
  } else if (pen.type === PenType.Line) {
    return pen.calculative.worldAnchors;
  }
}

export function calcResizeDock(
  store: TopologyStore,
  rect: Rect,
  pens: Pen[],
  resizeIndex: number
): { xDock: Point; yDock: Point } {
  const activePoints = rectToPoints(rect);
  return calcDockByPoints(store, activePoints);
}

function calcDockByPoints(
  store: TopologyStore,
  activePoints: Point[]
): { xDock: Point; yDock: Point } {
  let xDock: Point;
  let yDock: Point;
  let x = Infinity;
  let y = Infinity;
  const size = 8;
  for (const pen of store.data.pens) {
    if (pen.calculative.inView === false) {
      continue;
    }

    if (
      pen.type &&
      store.active.some((active) => isConnectLine(store, active, pen))
    ) {
      continue;
    }

    // 得到图形的全部点
    const points = getPointsByPen(pen);
    // 比对 points 中的点，必须找出最近的点，不可提前跳出
    for (const point of points) {
      for (const activePoint of activePoints) {
        const stepX = point.x - activePoint.x;
        const stepY = point.y - activePoint.y;
        const absStepX = Math.abs(stepX);
        const absStepY = Math.abs(stepY);
        if (absStepX < size && absStepX < x) {
          xDock = {
            x: Math.round(point.x) + 0.5,
            y: Math.round(point.y) + 0.5,
            step: stepX,
            prev: {
              x: Math.round(activePoint.x) + 0.5,
              y: Math.round(activePoint.y) + 0.5,
            },
            penId: pen.id,
          };
          x = absStepX;
        }
        if (absStepY < size && absStepY < y) {
          yDock = {
            x: Math.round(point.x) + 0.5,
            y: Math.round(point.y) + 0.5,
            step: stepY,
            prev: {
              x: Math.round(activePoint.x) + 0.5,
              y: Math.round(activePoint.y) + 0.5,
            },
            penId: pen.id,
          };
          y = absStepY;
        }
      }
    }
  }
  return {
    xDock,
    yDock,
  };
}

/**
 * 判断 line 是否是 active 的连接线（并且计算子节点）
 * @param store
 * @param active 本次计算的画笔
 * @param line 连线
 * @returns
 */
function isConnectLine(store: TopologyStore, active: Pen, line: Pen) {
  if (!line.type) {
    return false;
  }
  if (Array.isArray(active?.connectedLines)) {
    for (const cline of active?.connectedLines) {
      if (cline.lineId === line.id) {
        return true;
      }
    }
  }
  // 考虑子节点
  if (Array.isArray(active?.children)) {
    for (const id of active.children) {
      const child = store.pens[id];
      if (isConnectLine(store, child, line)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 是否近似于 num
 * @param num
 */
export function isEqual(source: number, target: number): boolean {
  // @ts-ignore
  return source.toFixed(12) == target;
}
