import '../../../js/utils/polyfil-nodeList-forEach'; // lt IE 12
import findAncestor from '../../../js/utils/findAncestor';
import { addClass } from '../../../js/utils/classModifiers';

export default class InformationPanelViewModel {
    constructor(module) {
        this.module = module;

        this.hookClose();
    }

    hookClose() {
        this.closeButton = this.module.querySelector('.information-panel__close');

        this.closeButton.addEventListener('click', (e) => {
            e.preventDefault();

            const informationPanel = findAncestor(e.currentTarget, 'information-panel');

            informationPanel.style.height = `${informationPanel.offsetHeight}px`;
            informationPanel.setAttribute('aria-hidden', true);

            setTimeout(() => {
                addClass(informationPanel, 'close');
            }, 100);
        });
    }

    static init(module) {
        new InformationPanelViewModel(module);
    }
}

window.ThamesWater = window.ThamesWater || [];
window.ThamesWater.TWInformationPanel = InformationPanelViewModel;
