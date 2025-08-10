import { LitElement, html, css } from 'lit';
import './app-header.js';
import './app-buffer-zone.js';
import './app-work-zone.js';

export class PolygonsApp extends LitElement {
    static styles = css`
        :host {
            --black: #363636;
            --light-gray: #CCCCCC;
            --gray: #949494;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 15px;
            color: var(--black);
            max-width: 1200px;
            margin: 0 auto;
            background-color: var(--light-gray);
        }
  `;

    render() {
        return html`
            <app-header></app-header>
            <app-buffer-zone></app-buffer-zone>
            <app-work-zone></app-work-zone>
        `;
    }
}

customElements.define('polygons-app', PolygonsApp);
