// vendor
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
// components
import ToolTip from 'Components/common/ToolTip';
// assets
import './Rollback.scss';

export default class Rollback extends Component {
  /**
    @param {Object} evt
    shows rollback modal, and passes record node to the modal
    @return {}
  */
  _toggleRollback(evt) {
    const { props } = this;
    props.toggleRollbackMenu(props.record.edge.node);
  }

  render() {
    const { props, state } = this,
          section = props.section,
          record = props.record;


    return (
        <div className="Rollback">
          <ToolTip section="activitySubmenu" />
            <div
              className="Rollback__button"
              onClick={evt => this._toggleRollback(evt)}>
              Rollback
            </div>
      </div>);
    }
}
