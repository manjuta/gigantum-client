// @flow
// vendor
import React, { Component } from 'react';
import ReactDom from 'react-dom';
// assets
import './Lightbox.scss';

type Props = {
  imageMetadata: string,
  onClose: Function,
}

class Lightbox extends Component<Props> {
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
    const { imageMetadata, onClose } = this.props;
    return (
      ReactDom
        .createPortal(
          <div className="Lightbox">
            <div
              className="Lightbox__cover"
              onClick={onClose}
              role="presentation"
            />
            <div className="Lightbox__container">
              <button
                className="Btn__expandable-close"
                onClick={onClose}
                type="button"
              >
                <span>Close</span>
              </button>
              <img src={imageMetadata} alt="detail" />
            </div>
          </div>,
          document.getElementById('lightbox'),
        )
    );
  }
}


export default Lightbox;
