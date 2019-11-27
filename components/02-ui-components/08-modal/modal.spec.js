import '../../../_jest/jest.test-setup';
import './modal';

const modalTemplate = require('./modal.hbs');

function click(element) {
    const event = document.createEvent('MouseEvent');
    event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(event);
}

function openTheModal() {
    const modalLink = document.body.querySelector('[data-module="TWModal"]');
    click(modalLink);
}

function removeModalLink() {
    const modalLink = document.body.querySelector('[data-module="TWModal"]');
    if (modalLink !== null) {
        document.body.removeChild(modalLink);
    }
}

function removeModalContainer() {
    const modalContainer = document.body.querySelector('.modal__container');
    if (modalContainer !== null) {
        modalContainer.remove();
    }
}

const modalObj = {
    data: {
        modalLink: {
            class: '',
            modalId: 'modal_1',
            text: 'Open modal'
        },
        modalSettings: {
            id: 'modal_1',
            titleId: 'modal_title_1',
            titleText: 'Modal Title'
        }
    },
    modal: {}
};

describe('A modal', () => {
    beforeAll(() => {
        modalObj.modal = modalTemplate(modalObj.data);
    });

    beforeEach(() => {
        document.body.innerHTML = modalObj.modal;
        const modalComponent = document.querySelector('[data-module]');
        window.ThamesWater.TWModal.init(modalComponent);
    });

    afterEach(() => {
        removeModalLink();
        removeModalContainer();
    });

    it('is rendered on the page', () => {
        const modal = document.body.querySelector('.modal');
        expect(modal).not.toBeNull();
    });

    it('link can be clicked to open a modal', () => {
        openTheModal();

        const modal = document.body.querySelector('.modal');
        expect(modal).not.toBeNull();
    });

    it('has a draggable bar', () => {
        openTheModal();

        const modalDraggable = document.body.querySelector('.modal__mobile-draggable');
        expect(modalDraggable).not.toBeNull();
    });

    it('has content', () => {
        openTheModal();

        const modalContent = document.body.querySelector('.modal__content');
        expect(modalContent).not.toBeNull();
    });

    it('has a close button', () => {
        openTheModal();

        const modalClose = document.body.querySelector('.modal__close');
        expect(modalClose).not.toBeNull();
    });

    it('close button will close the modal', () => {
        openTheModal();

        const modalClose = document.body.querySelector('.modal__close');
        click(modalClose);

        const modal = document.body.querySelector('.modal');
        expect(modal.classList.contains('modal--closed')).toBeTruthy();
    });
});
