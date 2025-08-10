import { LitElement, html, css } from 'lit';
import './app-button';

export class AppHeader extends LitElement {
    static styles = css`
        :host {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--black);
            padding: 20px 30px;
        }
  `;

    render() {
        return html`
            <app-button label="Создать"></app-button>
        `;
    }
}

customElements.define('app-header', AppHeader);