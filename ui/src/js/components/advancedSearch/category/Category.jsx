// @flow
// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';

type Props = {
  category: string,
  expandedIndex: number,
  filterCategories: Array,
  handleAddition: Function,
  index: number,
  setExpandedIndex: number,
  toggleTooltip: Function,
  tooltipShown: boolean,
}


class Category extends PureComponent<Props> {
  render() {
    const {
      category,
      expandedIndex,
      filterCategories,
      handleAddition,
      index,
      setExpandedIndex,
      toggleTooltip,
      tooltipShown,
    } = this.props;
    const expandedIndexToSet = (expandedIndex === index)
      ? null
      : index;
    // delcare css here
    const filterSecionCSS = classNames({
      'AdvancedSearch__filter-section': true,
      selected: (expandedIndex === index),
    });

    return (
      <div
        key={category}
        className="AdvancedSearch__filter-container"
      >
        <div
          className={filterSecionCSS}
          data-resetselectedfilter-id="AdvancedSearch__filter-section"
          key={category}
          onClick={() => setExpandedIndex(expandedIndexToSet)}
          role="presentation"
        >
          {category}
        </div>

        { (category === 'CUDA Version')
          && (
          <div
            className="AdvancedSearch__info"
            data-resetselectedfilter-id="AdvancedSearch__info"
            onClick={() => toggleTooltip(!tooltipShown)}
            role="presentation"
          >
            { tooltipShown
              && (
              <div className="InfoTooltip">
                CUDA enabled bases will automatically use the NVIDIA Container Runtime when NVIDIA drivers on the host are compatible with the CUDA version installed in the Base.&nbsp;&nbsp;
                <a
                  target="_blank"
                  href="https://docs.gigantum.com/docs/using-cuda-with-nvidia-gpus"
                  rel="noopener noreferrer"
                >
                  Learn more.
                </a>
              </div>
              )}
          </div>
          )}

        { (expandedIndex === index)
          && (
            <ul className="AdvancedSearch__filter-list">
              {
                filterCategories[category].map(filter => (
                  <li
                    key={filter}
                    className={`AdvancedSearch__li ${category}`}
                    onClick={() => handleAddition({ id: filter, text: filter }, category)}
                    role="presentation"
                  >
                    {filter}
                  </li>
                ))
                }
            </ul>
          )}
      </div>
    );
  }
}

export default Category;
