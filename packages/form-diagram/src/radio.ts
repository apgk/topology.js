import { getTextLength, initOptions } from './common';

export function radio(ctx: CanvasRenderingContext2D, pen: any) {
  if (!pen.onDestroy) {
    pen.onAdd = onAdd;
    pen.onMouseDown = onMousedown;
    pen.onValue = onValue;
  }
  let x = pen.calculative.worldRect.x;
  let y = pen.calculative.worldRect.y;
  let h = pen.calculative.worldRect.height;
  let w = pen.calculative.worldRect.width;
  if (!pen.optionPos) {
    return;
  }
  if (pen.direction == 'horizontal') {
    // const optionHeight = (pen.optionHeight * h) / pen.checkboxHeight;
    for (let i = 0; i < pen.optionPos.length; i++) {
      const gap = (pen.optionPos[i] * w) / pen.checkboxWidth;
      const isForbidden = pen.options[i].isForbidden;
      ctx.beginPath();
      ctx.arc(x + gap + h / 2, y + h / 2, h / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#d9d9d9';
      ctx.fillStyle = '#ffffff00';
      if (pen.options[i].isChecked) {
        ctx.strokeStyle = pen.options[i].background || '#1890ff';
      }
      if (isForbidden) {
        ctx.fillStyle = '#ebebeb';
        ctx.strokeStyle = '#d9d9d9';
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.save();
      if (!isForbidden && pen.options[i].isChecked) {
        ctx.beginPath();
        ctx.strokeStyle = pen.options[i].background
          ? pen.options[i].background + '20'
          : '#1890ff20';
        ctx.arc(x + h / 2 + gap, y + h / 2, h / 2 + 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = pen.options[i].background || '#1890ff';
        ctx.arc(x + h / 2 + gap, y + h / 2, h / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
      ctx.restore();

      //文字
      ctx.save();
      ctx.fillStyle = isForbidden ? '#00000040' : '#000000d9';
      const textScale = (pen.calculative.worldRect.height * 14) / 16;

      ctx.textAlign = 'start';
      ctx.textBaseline = 'middle';
      ctx.font =
        (pen.calculative.fontStyle || '') +
        ' normal ' +
        (pen.calculative.fontWeight || '') +
        ' ' +
        textScale +
        'px ' +
        pen.calculative.fontFamily;
      ctx.fillText(
        pen.options[i].text,
        x + h + gap + (10 / pen.checkboxWidth) * w,
        y + h / 2
      );
      ctx.restore();
    }
  } else if (pen.direction == 'vertical') {
    const optionHeight = (pen.optionHeight * h) / pen.checkboxHeight;
    for (let i = 0; i < pen.optionPos.length; i++) {
      const gap = (pen.optionPos[i] * h) / pen.checkboxHeight;
      const isForbidden = pen.options[i].isForbidden;
      ctx.beginPath();
      ctx.arc(
        x + optionHeight / 2,
        y + optionHeight / 2 + gap,
        optionHeight / 2,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = '#d9d9d9';
      ctx.fillStyle = '#ffffff00';
      if (pen.options[i].isChecked) {
        ctx.strokeStyle = pen.options[i].background || '#1890ff';
      }
      if (isForbidden) {
        ctx.fillStyle = '#ebebeb';
        ctx.strokeStyle = '#d9d9d9';
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.save();
      if (!isForbidden && pen.options[i].isChecked) {
        ctx.beginPath();
        ctx.strokeStyle = pen.options[i].background
          ? pen.options[i].background + '20'
          : '#1890ff20';
        ctx.arc(
          x + optionHeight / 2,
          y + optionHeight / 2 + gap,
          optionHeight / 2 + 1.5,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = pen.options[i].background || '#1890ff';
        ctx.arc(
          x + optionHeight / 2,
          y + optionHeight / 2 + gap,
          optionHeight / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.closePath();
      }
      ctx.restore();

      //文字
      ctx.save();
      ctx.fillStyle = isForbidden ? '#00000040' : '#000000d9';
      const textScale =
        (14 * pen.calculative.worldRect.height) / pen.checkboxHeight;
      ctx.textAlign = 'start';
      ctx.textBaseline = 'middle';
      ctx.font =
        (pen.calculative.fontStyle || '') +
        ' normal ' +
        (pen.calculative.fontWeight || '') +
        ' ' +
        textScale +
        'px ' +
        pen.calculative.fontFamily;
      ctx.fillText(
        pen.options[i].text,
        x + optionHeight + 10,
        y + optionHeight / 2 + gap
      );
      ctx.restore();
    }
  }
  return false;
}

function onAdd(pen: any) {
  initOptions(pen);
}

function onMousedown(pen: any, e: any) {
  if (pen.direction == 'horizontal') {
    let checkedIndex = -1;
    for (let i = 0; i < pen.optionPos.length; i++) {
      if (
        !pen.options[i].isForbidden &&
        e.x >
          pen.calculative.worldRect.x +
            (pen.optionPos[i] * pen.calculative.worldRect.width) /
              pen.checkboxWidth &&
        e.x <
          pen.calculative.worldRect.x +
            ((pen.optionPos[i] + pen.height) / pen.checkboxWidth) *
              pen.calculative.worldRect.width +
            getTextLength(pen.options[i].text, pen) +
            (10 / pen.checkboxWidth) * pen.calculative.worldRect.width
      ) {
        pen.options[i].isChecked = true;
        checkedIndex = i;
      }
    }
    if (checkedIndex !== -1) {
      pen.options.forEach((item: any, index: number) => {
        if (index !== checkedIndex) {
          item.isChecked = false;
        }
      });
    }
  } else if (pen.direction == 'vertical') {
    const scaleY = pen.calculative.worldRect.height / pen.checkboxHeight;
    let checkedIndex = -1;
    for (let i = 0; i < pen.optionPos.length; i++) {
      if (
        !pen.options[i].isForbidden &&
        e.y > pen.calculative.worldRect.y + pen.optionPos[i] * scaleY &&
        e.y <
          pen.calculative.worldRect.y +
            (pen.optionPos[i] + pen.optionHeight) * scaleY
      ) {
        pen.options[i].isChecked = true;
        checkedIndex = i;
      }
    }

    if (checkedIndex !== -1) {
      pen.options.forEach((item: any, index: number) => {
        if (index !== checkedIndex) {
          item.isChecked = false;
        }
      });
    }
  }
  pen.calculative.canvas.render(Infinity);
}

function onValue(pen: any) {
  initOptions(pen);
}
