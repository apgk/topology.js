import { Pen } from '.';
import { calcExy } from '../rect';

export function calcTextRect(pen: Pen) {
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } = pen.calculative;
  let x = paddingLeft;
  let y = paddingTop;
  let textWidth = pen.calculative.textWidth || pen.calculative.worldRect.width;
  textWidth < 1 && (textWidth = textWidth * pen.calculative.worldRect.width);
  let textHeight = pen.calculative.textHeight || pen.calculative.worldRect.height;
  textHeight < 1 && (textHeight = textHeight * pen.calculative.worldRect.height);
  let width = textWidth - paddingLeft - paddingRight;
  let height = textHeight - paddingTop - paddingBottom;
  let textLeft = pen.calculative.textLeft;
  let textTop = pen.calculative.textTop;
  if (textLeft && Math.abs(textLeft) < 1) {
    textLeft = pen.calculative.worldRect.width * textLeft;
  }

  if (textTop && Math.abs(textTop) < 1) {
    textTop = pen.calculative.worldRect.height * textTop;
  }
  x += textLeft || 0;
  y += textTop || 0;
  width -= textLeft || 0;
  height -= textTop || 0;

  x = pen.calculative.worldRect.x + x;
  y = pen.calculative.worldRect.y + y;

  const rect = {
    x,
    y,
    width,
    height,
  };
  calcExy(rect);
  pen.calculative.worldTextRect = rect;

  calcTextLines(pen);
  pen.calculative.textDrawRect = undefined;
}

export function calcTextDrawRect(ctx: CanvasRenderingContext2D, pen: Pen) {
  // By default, the text is center aligned.
  const lineHeight = pen.calculative.fontSize * pen.calculative.lineHeight;
  const h = pen.calculative.textLines.length * lineHeight;
  const textWidth = calcTextAdaptionWidth(ctx, pen);
  const rect = pen.calculative.worldTextRect;
  let x = rect.x + (rect.width - textWidth) / 2;
  let y = rect.y + (rect.height - h) / 2;
  const options = pen.calculative.canvas.store.options;
  const textAlign = pen.textAlign || options.textAlign;
  switch (textAlign) {
    case 'left':
      x = rect.x;
      break;
    case 'right':
      x = rect.x + rect.width - textWidth;
      break;
  }
  const textBaseline = pen.textBaseline || options.textBaseline;
  switch (textBaseline) {
    case 'top':
      y = rect.y;
      break;
    case 'bottom':
      y = rect.ey - h;
      break;
  }

  pen.calculative.textDrawRect = {
    x,
    y,
    width: textWidth,
    height: h,
  };
  calcExy(pen.calculative.textDrawRect);
}

export function calcTextLines(pen: Pen, text?: string) {
  if (!pen.calculative.text && !text) {
    pen.calculative.textLines = [];
    return;
  }
  if (!text) {
    text = pen.calculative.text;
  }
  text = text.toString();
  let lines: string[] = [];
  switch (pen.whiteSpace) {
    case 'nowrap':
      lines.push(text);
      break;
    case 'pre-line':
      lines = text.split(/[\n]/g);
      break;
    default:
      const paragraphs: string[] = text.split(/[\n]/g);
      const oneRowHeight = pen.calculative.fontSize * pen.calculative.lineHeight;
      const textHeight = pen.calculative.worldTextRect.height;
      const maxRows = Math.floor(textHeight / oneRowHeight) || 1;
      let currentRow = 0;
      outer: for (const paragraph of paragraphs) {
        const items = wrapLines(getWords(paragraph), pen);
        if (pen.ellipsis != false && items.length > 1) {
          for (const l of items) {
            currentRow++;
            if (currentRow > maxRows) {
              // 该行不要，把上一行最后变成 ...
              // TODO: 中文的三个字符宽度比 . 大，显示起来像是删多了
              lines[lines.length - 1] = lines[lines.length - 1].slice(0, -3) + '...';
              break outer;
            } else {
              lines.push(l);
            }
          }
        } else {
          lines.push(...items);
        }
      }
      break;
  }

  if (pen.calculative.keepDecimal || pen.calculative.keepDecimal === 0) {
    lines.forEach((text, i) => {
      const textNum = Number(text);
      if (!isNaN(textNum)) {
        lines[i] = textNum.toFixed(pen.calculative.keepDecimal);
      }
    });
  }

  pen.calculative.textLines = lines;

  return lines;
}

export function getWords(txt: string) {
  const words = [];
  let word = '';
  if (!txt) {
    txt = '';
  }
  for (let i = 0; i < txt.length; ++i) {
    const ch = txt.charCodeAt(i);
    if (ch < 33 || ch > 126) {
      if (word) {
        words.push(word);
        word = '';
      }
      words.push(txt[i]);
      continue;
    } else {
      word += txt[i];
    }
  }

  if (word) {
    words.push(word);
  }

  return words;
}

export function wrapLines(words: string[], pen: Pen) {
  const lines = [];
  let currentLine = words[0] || '';
  for (let i = 1; i < words.length; ++i) {
    const word = words[i] || '';
    const text = currentLine + word;
    const chinese = text.match(/[^\x00-\xff]/g) || '';
    const chineseLen = chinese.length;
    const textWidth = pen.calculative.worldTextRect.width;
    if (
      (text.length - chineseLen) * pen.calculative.fontSize * 0.6 + chineseLen * pen.calculative.fontSize <=
      textWidth
    ) {
      currentLine += word;
    } else {
      currentLine.length && lines.push(currentLine);
      currentLine = word;
    }
  }
  currentLine.length && lines.push(currentLine);
  return lines;
}

export function calcTextAdaptionWidth(ctx: CanvasRenderingContext2D, pen: Pen): number {
  let maxWidth = 0;
  pen.calculative.textLineWidths = [];
  pen.calculative.textLines.forEach((text: string) => {
    const width = ctx.measureText(text).width;
    pen.calculative.textLineWidths.push(width);
    maxWidth < width && (maxWidth = width);
  });
  return maxWidth;
}
