// vendor
import React, { Component } from 'react';
import classNames from 'classnames';

class Dropdown extends Component {
  /**
   * @param {Object} evt
   * @param {Object} item
   * stops progation and return item to parent method
   */
  _selectItem = (evt, item) => {
    const { itemAction } = this.props;
    evt.stopPropagation();
    itemAction(item);
  }

  render() {
    const {
      listItems,
      visibility,
      customStyle,
      listAction,
      label,
    } = this.props;
    const dropdownCSS = classNames({
      'Dropdown relative': true,
      'Dropdown--open': visibility,
      'Dropdown--collapsed': !visibility,
      [`Dropdown--${customStyle}`]: customStyle,
    });

    return (
      <div
        className={dropdownCSS}
        onClick={() => listAction()}
      >
        {label}
        {
          visibility && (
          <ul className="Dropdown__menu">
            {
              listItems.map(item => (
                <li
                  className="Dropdown__item"
                  key={item}
                  onClick={(evt) => { this._selectItem(evt, item); }}
                >
                  {item}
                </li>))
            }
          </ul>
          )
        }
      </div>
    );
  }
}


export default Dropdown;
