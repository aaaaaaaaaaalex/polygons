import { LitElement, html, svg, css } from 'lit';

export class WorkZone extends LitElement {
    static styles = css`
        :host {
            display: block;

            background-color: var(--light-gray);
        }
        svg {
            display: block;
            width: 100%;
            height: 400px;
            background-color: var(--black);
        }
        svg g {
            user-select: none;
        }
        polygon {
            cursor: pointer;
        }
    `;

    static properties = {
        polygons: { type: Array },
    };

    constructor() {
        super();
        this.polygons = [];
        this.vb = { x: 0, y: 0, w: 1000, h: 400 };
        this._isPanning = false;
        this._last = null;
    }

    firstUpdated() {
        const svg = this.renderRoot.querySelector('svg');
        svg.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
        svg.addEventListener('mousedown', (e) => this._onMouseDown(e));
        window.addEventListener('mousemove', (e) => this._onMouseMove(e));
        window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    }

    _setViewBox(x, y, w, h) {
        this.vb = { x, y, w, h };
        this.requestUpdate();
    }

    _onWheel(e) {
        e.preventDefault();
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const svgX = this.vb.x + (mx / rect.width) * this.vb.w;
        const svgY = this.vb.y + (my / rect.height) * this.vb.h;
        const zoomFactor = e.deltaY > 0 ? 1.12 : 0.9;
        const newW = this.vb.w * zoomFactor;
        const newH = this.vb.h * zoomFactor;
        const newX = svgX - (mx / rect.width) * newW;
        const newY = svgY - (my / rect.height) * newH;
        this._setViewBox(newX, newY, newW, newH);
    }

    _onMouseDown(e) {
        if (e.button !== 0) return;
        this._isPanning = true;
        this._last = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }

    _onMouseMove(e) {
        if (!this._isPanning || !this._last) return;
        const dx = e.clientX - this._last.x;
        const dy = e.clientY - this._last.y;
        const svg = this.renderRoot.querySelector('svg');
        const rect = svg.getBoundingClientRect();
        const svgDx = - dx / rect.width * this.vb.w;
        const svgDy = - dy / rect.height * this.vb.h;
        this._setViewBox(this.vb.x + svgDx, this.vb.y + svgDy, this.vb.w, this.vb.h);
        this._last = { x: e.clientX, y: e.clientY };
    }

    _onMouseUp() {
        this._isPanning = false;
        this._last = null;
    }

    render() {
        const xStep = Math.max(10, Math.round(this.vb.w / 10));
        const yStep = Math.max(10, Math.round(this.vb.h / 8));
        const xTicks = [];
        for (let x = Math.floor(this.vb.x); x < this.vb.x + this.vb.w; x += xStep) xTicks.push(x);
        const yTicks = [];
        for (let y = Math.floor(this.vb.y); y < this.vb.y + this.vb.h; y += yStep) yTicks.push(y);

        const vb = `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`;

        return html`
            <svg viewBox=${vb} @dragstart=${(e) => e.preventDefault()}>
                <!-- axes -->
                <g class="axes">
                    ${xTicks.map(x => svg`<line class="axis" x1=${x} y1=${this.vb.y} x2=${x} y2=${this.vb.y + this.vb.h} stroke="#FFF"></line>
                    <text x=${x + 2} y=${this.vb.y + 12} font-size="12" fill="#FFF">${Math.round(x)}</text>`)}
                    ${yTicks.map(y => svg`<line class="axis" x1=${this.vb.x} y1=${y} x2=${this.vb.x + this.vb.w} y2=${y} stroke="#FFF"></line>
                    <text x=${this.vb.x + 4} y=${y - 2} font-size="12" fill="#FFF">${Math.round(y)}</text>`)}
                </g>

                <!-- polygons -->
                ${this.polygons.map(poly => svg`
                    <polygon 
                        points=${poly.pointsStr}
                        fill=${poly.fill}
                        stroke=${poly.stroke}
                        stroke-width="1"
                    ></polygon>
                `)}
            </svg>
        `;
    }
}

customElements.define('work-zone', WorkZone);
