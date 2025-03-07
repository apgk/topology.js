import { ctxFlip, ctxRotate, drawImage, Pen } from '../pen';
import { TopologyStore } from '../store';
import { rgba } from '../utils';
import { createOffscreen } from './offscreen';

export class CanvasImage {
  canvas = document.createElement('canvas');
  /**
   * 非图片的绘制
   * isBottom true 指背景颜色，背景网格
   * isBottom false 指 标尺
   */
  otherOffsreen = createOffscreen();   // 非图片的
  offscreen = createOffscreen();
  animateOffsScreen = createOffscreen();

  constructor(public parentElement: HTMLElement, public store: TopologyStore, private isBottom?: boolean) {
    parentElement.appendChild(this.canvas);
    this.canvas.style.backgroundRepeat = 'no-repeat';
    this.canvas.style.backgroundSize = '100% 100%';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
  }

  resize(w?: number, h?: number) {
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    w = (w * this.store.dpiRatio) | 0;
    h = (h * this.store.dpiRatio) | 0;

    this.canvas.width = w;
    this.canvas.height = h;

    this.otherOffsreen.width = w;
    this.otherOffsreen.height = h;

    this.offscreen.width = w;
    this.offscreen.height = h;

    this.animateOffsScreen.width = w;
    this.animateOffsScreen.height = h;

    this.otherOffsreen.getContext('2d').scale(this.store.dpiRatio, this.store.dpiRatio);
    this.otherOffsreen.getContext('2d').textBaseline = 'middle';

    this.offscreen.getContext('2d').scale(this.store.dpiRatio, this.store.dpiRatio);
    this.offscreen.getContext('2d').textBaseline = 'middle';

    this.animateOffsScreen.getContext('2d').scale(this.store.dpiRatio, this.store.dpiRatio);
    this.animateOffsScreen.getContext('2d').textBaseline = 'middle';

    this.initStatus();
  }

  initStatus() {
    this.offscreen.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateOffsScreen.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const pen of this.store.data.pens) {
      if (this.hasImage(pen)) {   // 只影响本层的
        pen.calculative.imageDrawed = false;
      }
    }
    this.store.dirtyBackground = true;
    this.store.dirtyTop = true;
  }

  clear() {
    this.otherOffsreen.getContext('2d').clearRect(0, 0, this.otherOffsreen.width, this.otherOffsreen.height);
    this.offscreen.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateOffsScreen.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hasImage(pen: Pen) {
    pen.calculative.hasImage =
      pen.calculative &&
      pen.calculative.inView &&
      !pen.isBottom == !this.isBottom &&   // undefined == false 结果 false
      pen.image &&
      pen.calculative.img &&
      pen.name !== 'gif';

    return pen.calculative.hasImage;
  }

  render() {
    let dirty = false;
    let dirtyAnimate = false;
    for (const pen of this.store.data.pens) {
      if (this.hasImage(pen)) {
        if (this.store.animates.has(pen)) {
          dirtyAnimate = true;
        } else if (!pen.calculative.imageDrawed) {
          dirty = true;
        }
      }
    }

    const dirtyBackground = this.store.dirtyBackground;
    if (dirtyBackground && this.isBottom) {
      const ctx = this.otherOffsreen.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const background = this.store.data.background || this.store.options.background;
      if (background) {
        ctx.save();
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
      }
      this.renderGrid(ctx);
    }

    const dirtyTop = this.store.dirtyTop;
    if (dirtyTop && !this.isBottom) {
      const ctx = this.otherOffsreen.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.renderRule(ctx);
    }

    if (dirty) {
      const ctx = this.offscreen.getContext('2d');
      ctx.save();
      ctx.translate(this.store.data.x, this.store.data.y);
      for (const pen of this.store.data.pens) {
        if (!pen.calculative.hasImage || pen.calculative.imageDrawed || this.store.animates.has(pen)) {
          continue;
        }
        pen.calculative.imageDrawed = true;
        ctx.save();
        ctxFlip(ctx, pen);
        if (pen.calculative.rotate) {
          ctxRotate(ctx, pen);
        }

        drawImage(ctx, pen);
        ctx.restore();
      }
      ctx.restore();
    }
    if (dirtyAnimate) {
      const ctx = this.animateOffsScreen.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.translate(this.store.data.x, this.store.data.y);
      for (const pen of this.store.animates) {
        if (!pen.calculative.hasImage) {
          continue;
        }
        pen.calculative.imageDrawed = true;
        ctx.save();
        ctxFlip(ctx, pen);
        if (pen.calculative.rotate) {
          ctxRotate(ctx, pen);
        }

        drawImage(ctx, pen);
        ctx.restore();
      }
      ctx.restore();
    }

    if (dirty || dirtyAnimate || (dirtyBackground && this.isBottom) || (dirtyTop && !this.isBottom)) {
      const ctxCanvas = this.canvas.getContext('2d');
      ctxCanvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.isBottom) {
        ctxCanvas.drawImage(this.otherOffsreen, 0, 0, this.canvas.width, this.canvas.height);
        this.store.dirtyBackground = false;
      }
      ctxCanvas.drawImage(this.offscreen, 0, 0, this.canvas.width, this.canvas.height);
      ctxCanvas.drawImage(this.animateOffsScreen, 0, 0, this.canvas.width, this.canvas.height);
      if (!this.isBottom) {
        ctxCanvas.drawImage(this.otherOffsreen, 0, 0, this.canvas.width, this.canvas.height);
        this.store.dirtyTop = false;
      }
    }
  }

  renderGrid(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    if (!this.store.options.grid && !this.store.data.grid) {
      return;
    }
    ctx.save();
    if (this.store.data.gridRotate) {
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      ctx.rotate((this.store.data.gridRotate * Math.PI) / 180);
      ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.store.data.gridColor || this.store.options.gridColor;
    ctx.beginPath();
    const size = (this.store.data.gridSize || this.store.options.gridSize) * this.store.data.scale;
    const longSide = Math.max(this.canvas.width, this.canvas.height);
    const count = Math.ceil(longSide / size);
    for (let i = -size * count; i < longSide * 2; i += size) {
      ctx.moveTo(i, -longSide);
      ctx.lineTo(i, longSide * 2);
    }
    for (let i = -size * count; i < longSide * 2; i += size) {
      ctx.moveTo(-longSide, i);
      ctx.lineTo(longSide * 2, i);
    }
    ctx.stroke();
    ctx.restore();
  }

  renderRule(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    if (!this.store.options.rule && !this.store.data.rule) {
      return;
    }

    const span = this.store.data.scale * 10;

    ctx.save();

    ctx.strokeStyle = rgba(this.store.data.ruleColor || this.store.options.ruleColor, 0.7);

    const x = this.store.data.origin.x + this.store.data.x;
    const y = this.store.data.origin.y + this.store.data.y;
    const { width, height } = this.canvas;

    // horizontal rule
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.lineDashOffset = -x % span;
    ctx.setLineDash([1, span - 1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();

    // vertical rule
    ctx.beginPath();
    ctx.lineDashOffset = -y % span;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // the big rule
    ctx.strokeStyle = this.store.data.ruleColor || this.store.options.ruleColor;
    ctx.beginPath();
    ctx.lineWidth = 24;
    ctx.lineDashOffset = -x % (span * 10);
    ctx.setLineDash([1, span * 10 - 1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineDashOffset = -y % (span * 10);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle;
    let text: number = 0 - Math.floor(x / span / 10) * 100;
    if (x < 0) {
      text -= 100;
    }
    for (let i = x % (span * 10); i < width; i += 10 * span, text += 100) {
      if (span < 3 && text % 500) {
        continue;
      }
      ctx.fillText(text.toString(), i + 4, 16);
    }

    text = 0 - Math.floor(y / span / 10) * 100;
    if (y < 0) {
      text -= 100;
    }
    for (let i = y % (span * 10); i < height; i += 10 * span, text += 100) {
      if (span < 3 && text % 500) {
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.translate(16, i - 4);
      ctx.rotate((270 * Math.PI) / 180);
      ctx.fillText(text.toString(), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
  
}
