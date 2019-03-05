// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './DatasetSort.scss';


class DatasetSort extends Component {

  state = {

  }

  /**
    *  @param {}
    *  gets orderBy and sort value and displays it to the UI more clearly
    *  @return{}
  */
  _getSelectedSort() {
    if (this.props.orderBy === 'modified_on') {
      return `Modified Date ${this.props.sort === 'asc' ? '(Oldest)' : '(Newest)'}`;
    } else if (this.props.orderBy === 'created_on') {
      return `Creation Date ${this.props.sort === 'asc' ? '(Oldest)' : '(Newest)'}`;
    }

    return this.props.sort === 'asc' ? 'A-Z' : 'Z-A';
  }

  render() {
    const { props, state } = this;

    const datasetSortSeclectorCSS = classNames({
      'DatasetSort__selector Dropdown': true,
      'Dropdown--open': props.sortMenuOpen,
      'Dropdown--collapsed': !props.sortMenuOpen,
    });

    const datasetSortMenuCSS = classNames({
      'Dropdown__menu DatasetSort__menu box-shadow': true,
      hidden: !props.sortMenuOpen,
    });

    return (

      <div className="DatasetSort column-4-span-3 padding--0">
        Sort by:

        <span
          className={datasetSortSeclectorCSS}
          onClick={props.toggleSortMenu}>
          {this._getSelectedSort()}
        </span>

        <ul className={datasetSortMenuCSS}>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('modified_on', 'desc')}>
            Modified Date (Newest) { (props.orderBy === 'modified_on') && (props.sort !== 'asc') ? '✓ ' : ''}
          </li>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('modified_on', 'asc')}>
            Modified Date (Oldest) { (props.orderBy === 'modified_on') && (props.sort === 'asc') ? '✓ ' : '' }
          </li>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('created_on', 'desc')}>
            Creation Date (Newest) { (props.orderBy === 'created_on') && (props.sort !== 'asc') ? '✓ ' : '' }
          </li>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('created_on', 'asc')}>
            Creation Date (Oldest) { (props.orderBy === 'created_on') && (props.sort === 'asc') ? '✓ ' : '' }
          </li>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('name', 'asc')}>
            A-Z { (props.orderBy === 'name') && (props.sort === 'asc') ? '✓ ' : '' }
          </li>

          <li
            className="DatasetSort__list-item"
            onClick={() => props.setSortFilter('name', 'desc')}>
            Z-A { (props.orderBy === 'name') && (props.sort !== 'asc') ? '✓ ' : '' }
          </li>

        </ul>

      </div>);
  }
}

export default DatasetSort;
