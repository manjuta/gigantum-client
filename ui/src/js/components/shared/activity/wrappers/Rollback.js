// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import Tooltip from 'Components/common/Tooltip';
// assets
import './Rollback.scss';

export default class Rollback extends Component {
  /**
    @param {} -
    shows rollback modal, and passes record node to the modal
    @return {}
  */
  _toggleRollback = () => {
    const { props } = this;
    props.toggleRollbackMenu(props.record.edge.node);
  }

  render() {
    const { props } = this;
    const { record } = props;

    // declare css here
    const rollbackCSS = classNames({
      Rollback: true,
      'Rollback--locked': props.isLocked,
      'Tooltip-data Tooltip-data--right': props.isLocked,
    });

    return (
      <div
        className={rollbackCSS}
        data-tooltip="Can't rollback when the container is running."
      >
        <Tooltip section="activitySubmenu" />
        <button
          type="button"
          disabled={props.isLocked}
          onMouseEnter={() => props.setHoveredRollback(record.flatIndex)}
          onMouseLeave={() => props.setHoveredRollback(null)}
          className="Rollback__button"
          onClick={() => this._toggleRollback()}
        >
              Rollback
        </button>
      </div>
    );
  }
}
