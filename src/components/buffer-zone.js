import { LitElement, html, svg, css } from 'lit';
import './app-button';
import { randPolygons, isInZone } from '../utils.js';

export class BufferZone extends LitElement {
    static styles = css`
        :host {
            display: block;
            background-color: var(--light-gray);
        }
        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--black);
            padding: 25px 40px;
            margin-bottom: 15px;
        }
        .toolbar__right {
            display: flex;
            gap: 20px;
        }
        svg {
            display: block;
            width: 100%;
            height: 400px;
            background-color: var(--black);
        }
        polygon {
            cursor: grab;
        }
  `;

    static properties = {
        polygons: { type: Array },
    };

    constructor() {
        super();
        this.polygons = [];
        this.vb = { x: 0, y: 0, w: 1000, h: 400 };
    }

    _create() {
        const list = randPolygons(5 + Math.floor(Math.random() * 16));
        this.dispatchEvent(new CustomEvent('polygons-created', {
            detail: list,
            bubbles: true,
            composed: true
        }));
    }

    _save() {
        this.dispatchEvent(new CustomEvent('polygons-save', {
            bubbles: true,
            composed: true
        }));
    }

    _reset() {
        this.dispatchEvent(new CustomEvent('polygons-reset', {
            bubbles: true,
            composed: true
        }));
    }

    _onPointerDown(e, poly) {
        const svg = this.shadowRoot.querySelector('svg');
        const svgRect = svg.getBoundingClientRect();

        this.offsetX = e.clientX - svgRect.left;
        this.offsetY = e.clientY - svgRect.top;

        this.draggedPoly = poly;
        this.polygons = this.polygons.filter(p => p !== poly);
        this.requestUpdate();

        this.clone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.clone.setAttribute("viewBox", "0 0 1000 400");
        this.clone.style.position = "absolute";
        this.clone.style.left = `${e.clientX - this.offsetX + window.scrollX}px`;
        this.clone.style.top = `${e.clientY - this.offsetY + window.scrollY}px`;
        this.clone.style.width = svgRect.width + "px";
        this.clone.style.height = svgRect.height + "px";
        this.clone.style.pointerEvents = "none";
        this.clone.style.zIndex = "1000";

        // TODO: уменьшить область временного svg слоя
        // TODO: сделать cursor: pointer на перетаскиваемом полигоне

        const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        p.setAttribute("points", poly.pointsStr);
        p.setAttribute("fill", poly.fill);
        p.setAttribute("stroke", "#FFF");
        p.setAttribute("stroke-width", "1");
        p.style.opacity = "0.9";

        this.clone.appendChild(p);
        document.body.appendChild(this.clone);

        window.addEventListener("pointermove", this.onPointerMove);
        window.addEventListener("pointerup", this.onPointerUp);
    }

    onPointerMove = (e) => {
        this.clone.style.left = `${e.clientX - this.offsetX + window.scrollX}px`;
        this.clone.style.top = `${e.clientY - this.offsetY + window.scrollY}px`;
    };

    onPointerUp = (e) => {
        if (!this.draggedPoly) return;

        window.removeEventListener("pointermove", this.onPointerMove);
        window.removeEventListener("pointerup", this.onPointerUp);

        const polygonsApp = document.querySelector('polygons-app');
        const workZone = polygonsApp.shadowRoot.querySelector('work-zone');

        const bufferZoneSvg = this.shadowRoot.querySelector('svg');
        const bufferZoneSvgRect = bufferZoneSvg.getBoundingClientRect();

        const workZoneSvg = workZone.shadowRoot.querySelector('svg');
        const workZoneSvgRect = workZoneSvg.getBoundingClientRect();

        if (isInZone(e, bufferZoneSvgRect)) {
            const cloneRect = this.clone.getBoundingClientRect();
            const offsetX = cloneRect.left - bufferZoneSvgRect.left;
            const offsetY = cloneRect.top - bufferZoneSvgRect.top;

            const newPoints = this.draggedPoly.points.map(pt => ({
                x: pt.x + (offsetX / bufferZoneSvgRect.width) * this.vb.w,
                y: pt.y + (offsetY / bufferZoneSvgRect.height) * this.vb.h
            }));

            this.draggedPoly.points = newPoints;
            this.draggedPoly.pointsStr = newPoints.map(pt => `${pt.x},${pt.y}`).join(" ");

            this.polygons = [...this.polygons, this.draggedPoly];
            this.requestUpdate();
        } else if (isInZone(e, workZoneSvgRect)) {
            const cloneRect = this.clone.getBoundingClientRect();
            const offsetX = cloneRect.left - workZoneSvgRect.left;
            const offsetY = cloneRect.top - workZoneSvgRect.top;

            const workVB = workZoneSvg.viewBox.baseVal;

            const newPoints = this.draggedPoly.points.map(pt => ({
                x: pt.x + (offsetX / workZoneSvgRect.width) * workVB.width,
                y: pt.y + (offsetY / workZoneSvgRect.height) * workVB.height
            }));

            this.draggedPoly.points = newPoints;
            this.draggedPoly.pointsStr = newPoints.map(pt => `${pt.x},${pt.y}`).join(" ");

            this.dispatchEvent(new CustomEvent('polygon-move-to-work', {
                detail: this.draggedPoly,
                bubbles: true,
                composed: true,
            }));
        } else {
            this.polygons = [...this.polygons, this.draggedPoly];
            this.requestUpdate();
        }

        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }

        this.draggedPoly = null;
    }

    render() {
        return html`
            <div class="toolbar">
                <div class="toolbar__left">
                    <app-button label="Создать" @click=${this._create}></app-button>
                </div>
                <div class="toolbar__right">
                    <app-button label="Сохранить" @click=${this._save}></app-button>
                    <app-button label="Сбросить" @click=${this._reset}></app-button>
                </div>
            </div>

            <svg viewBox="0 0 1000 400" @dragstart=${(e) => e.preventDefault()}>
                ${this.polygons.map(poly => svg`
                    <polygon
                        points=${poly.pointsStr}
                        fill=${poly.fill}
                        stroke=${poly.stroke}
                        stroke-width="1"
                        @pointerdown=${(e) => this._onPointerDown(e, poly)}
                    ></polygon>  
                `)}
            </svg>
        `;
    }
}

customElements.define('buffer-zone', BufferZone);