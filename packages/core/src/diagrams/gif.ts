import { Pen, setElemPosition } from "../pen";

export const gifsList: {
  [key: string]: HTMLImageElement;
} = {};

export function gif(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    pen.onMove = move;
    pen.onResize = resize;
    pen.onRotate = move;
    pen.onValue = value;
    pen.onChangeId = changeId;
  }

  const path = new Path2D();
  if (!pen.image) {
    return;
  }

  if (!gifsList[pen.id]) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = pen.image;
    gifsList[pen.id] = img; // 提前赋值，避免重复创建
    img.onload = () => {
      pen.calculative.img = img;
      pen.calculative.imgNaturalWidth = img.naturalWidth || pen.iconWidth;
      pen.calculative.imgNaturalHeight = img.naturalHeight || pen.iconHeight;
      pen.calculative.canvas.externalElements &&
        pen.calculative.canvas.externalElements.appendChild(img);
      setElemPosition(pen, img);
    };
  }

  if (pen.calculative.dirty && gifsList[pen.id]) {
    setElemPosition(pen, gifsList[pen.id]);
  }
  return path;
}

function destory(pen: Pen) {
  gifsList[pen.id].remove();
  gifsList[pen.id] = undefined;
}

function move(pen: Pen) {
  if (!gifsList[pen.id]) {
    return;
  }
  setElemPosition(pen, gifsList[pen.id]);
}

function resize(pen: Pen) {
  if (!gifsList[pen.id]) {
    return;
  }
  setElemPosition(pen, gifsList[pen.id]);
}

function value(pen: Pen) {
  if (!gifsList[pen.id]) {
    return;
  }
  setElemPosition(pen, gifsList[pen.id]);
  if (gifsList[pen.id].getAttribute('src') !== pen.image) {
    gifsList[pen.id].src = pen.image;
  }
}

function changeId(pen: Pen, oldId: string, newId: string) {
  if (!gifsList[oldId]) {
    return;
  }
  gifsList[newId] = gifsList[oldId];
  delete gifsList[oldId];
}
