import { LitElement, html, css } from 'lit';
import './buffer-zone.js';
import './work-zone.js';

export class PolygonsApp extends LitElement {
    static styles = css`
        :host {
            --black: #363636;
            --light-gray: #CCCCCC;
            --gray: #949494;
            position: relative;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 15px;
            color: var(--black);
            max-width: 1000px;
            margin: 0 auto;
            background-color: var(--light-gray);
        }
  `;

    static properties = {
        bufferPolygons: { state: true },
        workPolygons: { state: true },
    };

    constructor() {
        super();
        this.bufferPolygons = [];
        this.workPolygons = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this.addEventListener('polygons-created', (e) => {
            this.bufferPolygons = [...this.bufferPolygons, ...e.detail];
        });

        this.addEventListener('polygon-dropped', (e) => {
            const poly = e.detail;
            this.bufferPolygons = this.bufferPolygons.filter(p => p.id !== poly.id);
            this.workPolygons = [...this.workPolygons, poly];
        });
    }

    render() {
        return html`
            <buffer-zone .polygons=${this.bufferPolygons}></buffer-zone>
            <work-zone .polygons=${this.workPolygons}></work-zone>
        `;
    }
}

customElements.define('polygons-app', PolygonsApp);
