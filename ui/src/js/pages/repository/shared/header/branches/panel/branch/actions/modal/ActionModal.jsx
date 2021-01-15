// @flow
// vendor
import React, { Node, useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
// css
import './ActionModal.scss';


type Props = {
  branch: Object,
  children: Node,
  disableConfirm: boolean,
  handleConfirm: Function,
  header: string,
  modalType: string,
  toggleModal: Function,
};

const ActionModal = ({
  branch,
  children,
  disableConfirm,
  handleConfirm,
  header,
  modalType,
  toggleModal,
}: Props) => {
  const modalPopup = useRef();

  const closeModal = (evt) => {
    if (modalPopup && !modalPopup.current.contains(evt.target)) {
      toggleModal(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', closeModal);

    // returned function will be called on component unmount
    return () => {
      window.removeEventListener('click', closeModal);
    };
  }, []);

  return (
    ReactDom.createPortal(
      <div
        className={`ActionModal ActionModal--${modalType}`}
        ref={modalPopup}
      >
        <div
          role="presentation"
          className="ActionModal__close"
          onClick={() => toggleModal(false)}
        />

        <div className="ActionModal__header">
          {header}
        </div>

        <div>
          {children}
        </div>

        <div className="ActionModal__buttons">
          <button
            type="button"
            onClick={() => toggleModal(false)}
            className="Btn--flat"
          >
            Cancel
          </button>
          <button
            type="button"
            className="ActionModal__btn--confirm"
            disabled={disableConfirm}
            onClick={() => handleConfirm(branch)}
          >
            Confirm
          </button>
        </div>
      </div>,
      document.getElementById('confirmation__popup'),
    )
  );
};

export default ActionModal;
