import feature from 'feature-js';
import { addClass, removeClass, hasClass } from '../../../js/utils/classModifiers';
import makeDraggableItem from '../../../js/utils/makeDraggableItem';
import '../../../js/utils/polyfil-nodeList-forEach'; // lt IE 12

export default class ModalViewModel {
    constructor(module) {
        this.modal = document.body.querySelector(`#${module.getAttribute('data-modal')}`);

        this.hookModalLink(module);
        this.hookCloseButton();

        if (feature.touch) {
            this.hookDraggableArea();
        }
    }

    hookModalLink(module) {
        module.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        }, this);
    }

    hookCloseButton() {
        this.closeButton = this.modal.querySelector('.modal__close');

        this.closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal();
        });
    }

    showModal() {
        removeClass(this.modal, 'modal--closed');
        addClass(document.body, 'modal--active');
    }

    hideModal() {
        addClass(this.modal, 'modal--closed');
        removeClass(document.body, 'modal--active');
    }

    hookDraggableArea() {
        this.draggableSettings = {
            canMoveLeft: false,
            canMoveRight: false,
            moveableElement: this.modal.firstElementChild,
        };

        makeDraggableItem(this.modal, this.draggableSettings, (touchDetail) => {
            this.handleTouch(touchDetail);
        }, this);
    }

    handleTouch(touchDetail) {
        this.touchDetail = touchDetail;
        const offset = this.touchDetail.moveableElement.offsetTop;

        if (this.touchDetail.type === 'tap') {
            if (hasClass(this.touchDetail.eventObject.target, 'modal__mobile-draggable')) {

                if (offset === this.touchDetail.originY) {
                    this.touchDetail.moveableElement.style.top = '0px';
                } else {
                    this.touchDetail.moveableElement.style.top = `${this.touchDetail.originY}px`;
                }

            } else if (offset > this.touchDetail.originY) {
                this.touchDetail.moveableElement.style.top = `${this.touchDetail.originY}px`;
            } else {
                this.touchDetail.eventObject.target.click();
            }
        } else if (this.touchDetail.type === 'flick' || (this.touchDetail.type === 'drag' && this.touchDetail.distY > 200)) {

            if (this.touchDetail.direction === 'up') {

                if (offset < this.touchDetail.originY) {
                    this.touchDetail.moveableElement.style.top = '0px';
                } else if (offset > this.touchDetail.originY) {
                    this.touchDetail.moveableElement.style.top = `${this.touchDetail.originY}px`;
                }

            } else if (this.touchDetail.direction === 'down') {

                if (offset < this.touchDetail.originY) {
                    this.touchDetail.moveableElement.style.top = `${this.touchDetail.originY}px`;
                } else if (offset > this.touchDetail.originY) {
                    this.touchDetail.moveableElement.style.top = '95%';
                }

            }
        } else {
            this.touchDetail.moveableElement.style.top = `${this.touchDetail.moveableElementStartY}px`;
        }
    }

    static init(module) {
        new ModalViewModel(module);
    }
}

window.ThamesWater = window.ThamesWater || [];
window.ThamesWater.TWModal = ModalViewModel;
