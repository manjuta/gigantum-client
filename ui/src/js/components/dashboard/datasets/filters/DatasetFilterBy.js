// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './DatasetFilterBy.scss';


class DatasetFilterBy extends Component {

  /**
    *  @param {}
    *  gets filter value and displays it to the UI more clearly
  */
  _getFilter() {
    switch (this.props.filter) {
      case 'all':
        return 'All';
      case 'owner':
        return 'My Datasets';
      case 'others':
        return 'Shared With Me';
      default:
        return this.props.filter;
    }
  }

  render() {
    const { props } = this;

    const datasetFilterSeclectorCSS = classNames({
      'Dropdown DatasetFilterBy__selector': true,
      'Dropdown--open': props.filterMenuOpen,
      'Dropdown--collapsed': !props.filterMenuOpen,
    });

    const datasetFilterMenuCSS = classNames({
      'Dropdown__menu DatasetFilterBy__menu box-shadow': true,
      hidden: !props.filterMenuOpen,
    });

    return (

      <div className="DatasetFilterBy column-4-span-3 padding--0">
        Filter by:
        <span
          className={datasetFilterSeclectorCSS}
          onClick={props.toggleFilterMenu}>
          {this._getFilter()}
        </span>
        <ul className={datasetFilterMenuCSS}>
          <li
            className="DatasetFilterBy__list-item"
            onClick={() => props.setFilter('all')}>
            All { (props.filter === 'all') ? '✓ ' : ''}
          </li>
          <li
            className="DatasetFilterBy__list-item"
            onClick={() => props.setFilter('owner')}>
            My Datasets { (props.filter === 'owner') ? '✓ ' : ''}
          </li>
          <li
            className="DatasetFilterBy__list-item"
            onClick={() => props.setFilter('others')}>
            Shared with me { (props.filter === 'others') ? '✓ ' : ''}
          </li>
        </ul>
      </div>);
  }
}

export default DatasetFilterBy;
