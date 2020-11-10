// vendor
import React, { Component, Node } from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
// assets
import './Modal.scss';

type Props = {
  children: Node,
  handleClose: Function,
  header: string,
  icon: string,
  noPadding: Boolean,
  noPaddingModal: Boolean,
  overlfow: Boolean,
  preHeader: string,
  size: string,
}

class Modal extends Component<Props> {
  componentDidMount() {
    if (document.getElementById('root')) {
      document.getElementById('root').classList.add('no-overflow');
    }
  }

  componentWillUnmount() {
    if (document.getElementById('root')) {
      document.getElementById('root').classList.remove('no-overflow');
    }
  }

  render() {
    const {
      children,
      handleClose,
      header,
      icon,
      noPadding,
      noPaddingModal,
      overlfow,
      preHeader,
      size,
    } = this.props;
    const overflow = (overlfow === 'visible') ? 'visible' : 'hidden';
    // declare css here
    const modalContentCSS = classNames({
      Modal__content: true,
      'Modal__content--noPadding': noPaddingModal,
      [`Modal__content--${size}`]: size, // large, medium, small
      [icon]: !!icon,
    });
    const modalContainerCSS = classNames({
      'Modal__sub-container': true,
      'Modal__sub-container--nopadding': noPadding,
    });

    return (
      ReactDom.createPortal(
        <div className="Modal">
          <div
            className="Modal__cover"
            onClick={handleClose}
            role="presentation"
          />

          <div className={modalContentCSS} style={{ overflow }}>
            { handleClose && (
              <button
                type="button"
                className="Btn Btn--flat Modal__close padding--small "
                onClick={() => handleClose()}
              />
            )}
            <div className="Modal__container">
              { preHeader && (
                <p className="Modal__pre-header">
                  {preHeader}
                </p>
              )}
              { header && (
                <>
                  <h1 className="Modal__header">
                    <div className={`Icon Icon--${icon}`} />
                    {header}
                  </h1>
                  <hr />
                </>
              )}
              <div className={modalContainerCSS}>
                {children}
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal'),
      )
    );
  }
}

export default Modal;
