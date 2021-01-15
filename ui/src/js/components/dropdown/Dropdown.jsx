// vendor
import React, { Component } from 'react';
import classNames from 'classnames';

type Props = {
  customStyle: boolean,
  itemAction: Function,
  label: string,
  listAction: Function,
  listItems: Array,
  visibility: boolean,
}

class Dropdown extends Component<Props> {
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
      customStyle,
      label,
      listAction,
      listItems,
      visibility,
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
        role="presentation"
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
                  role="presentation"
                >
                  {item}
                </li>
              ))
            }
          </ul>
          )
        }
      </div>
    );
  }
}


export default Dropdown;
