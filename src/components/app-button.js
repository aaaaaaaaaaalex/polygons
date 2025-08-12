import { LitElement, html, css } from 'lit';

export class AppButton extends LitElement {
    static properties = {
        label: { type: String },
        disabled: { type: Boolean },
    };

    static styles = css`
        button {
            padding: 8px 24px;
            font-size: 1rem;
            border: none;
            border-radius: 4px;
            background-color: var(--gray);
            color: var(--black);
            cursor: pointer;
        }
  `;

    constructor() {
        super();
        this.label = 'Button';
        this.disabled = false;
    }

    _handleClick(e) {
        this.dispatchEvent(new CustomEvent('button-click', {
            detail: e,
            bubbles: true,
            composed: true,
        }));
    }


    render() {
        return html`
            <button ?disabled=${this.disabled} @click=${this._handleClick}>
                ${this.label}
            </button>
        `;
    }
}

customElements.define('app-button', AppButton);
