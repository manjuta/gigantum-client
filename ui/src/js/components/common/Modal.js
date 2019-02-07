// vendor
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
// assets
import './Modal.scss';

export default class Modal extends Component {
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
    const { props } = this;
    const modalContentCSS = classNames({
      Modal__content: true,
      [props.size]: props.size, // large, medium, small
      [props.icon]: props.icon,
    });
    const modalContainerCSS = classNames({
      'Modal__sub-container': true,
      'Modal__sub-container--nopadding': props.noPadding,
    });
    return (
      <div className="Modal">

        <div
          className="Modal__cover"
          onClick={props.handleClose}
        />

        <div className={modalContentCSS}>
          { props.handleClose
            && <div
              className="Modal__close"
              onClick={() => props.handleClose()}
            />
          }
          <div className="Modal__container">
            { props.preHeader
              && <p className="Modal__pre-header">{props.preHeader}</p>
            }
            { props.header
              && <Fragment>
                <h4 className="Modal__header">{props.header}</h4>
                <hr />
              </Fragment>
            }
            <div className={modalContainerCSS}>
              {
                props.renderContent()
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
