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
        const bufferPolygons = localStorage.getItem('polygons-buffer');
        const workPolygons = localStorage.getItem('polygons-work');
        if (bufferPolygons) {
            this.bufferPolygons = JSON.parse(bufferPolygons);
        }
        if (workPolygons) {
            this.workPolygons = JSON.parse(workPolygons);
        }
        this.addEventListener('polygons-created', this._onPolygonsCreated);
        this.addEventListener('polygons-save', this._onPolygonsSave);
        this.addEventListener('polygons-reset', this._onPolygonsReset);
        this.addEventListener('polygon-move-to-work', this._onPolygonMoveToWork);
        this.addEventListener('polygon-move-to-buffer', this._onPolygonMoveToBuffer);
    }

    disconnectedCallback() {
        this.removeEventListener('polygons-created', this._onPolygonsCreated);
        this.removeEventListener('polygons-save', this._onPolygonsSave);
        this.removeEventListener('polygons-reset', this._onPolygonsReset);
        this.removeEventListener('polygon-move-to-work', this._onPolygonMoveToWork);
        this.removeEventListener('polygon-move-to-buffer', this._onPolygonMoveToBuffer);
        super.disconnectedCallback();
    }

    _onPolygonsCreated = (e) => {
        this.bufferPolygons = e.detail;
    }

    _onPolygonsSave = () => {
        localStorage.setItem('polygons-buffer', JSON.stringify(this.bufferPolygons));
        localStorage.setItem('polygons-work', JSON.stringify(this.workPolygons));
    }

    _onPolygonsReset = () => {
        localStorage.removeItem('polygons-buffer');
        localStorage.removeItem('polygons-work');
    }

    _onPolygonMoveToWork = (e) => {
        const poly = e.detail;
        this.bufferPolygons = this.bufferPolygons.filter(p => p !== poly);
        this.workPolygons = [...this.workPolygons, poly];
    }

    _onPolygonMoveToBuffer = (e) => {
        const poly = e.detail;
        this.workPolygons = this.workPolygons.filter(p => p !== poly);
        this.bufferPolygons = [...this.bufferPolygons, poly];
    }

    render() {
        return html`
            <buffer-zone .polygons=${this.bufferPolygons}></buffer-zone>
            <work-zone .polygons=${this.workPolygons}></work-zone>
        `;
    }
}

customElements.define('polygons-app', PolygonsApp);
