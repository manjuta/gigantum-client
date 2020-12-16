// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import { WithContext, WithOutContext } from 'react-tag-input';
// component
import Category from './Category';
// assets
import './AdvancedSearch.scss';
import './AdvancedSearchOverrides.scss';


type Props = {
  autoHide: boolean,
  customStyle: Object,
  filterCategories: Array,
  setTags: Function,
  showButton: boolean,
  tags: Array,
  withoutContext: Function,
}

/**
* Method filters categories and pushes data an object array and string array.
* @param {Array} filterCategories
*
* @return {Object}
*/
const getSuggestions = (filterCategories) => {
  const suggestions = [];
  const rawKeys = [];

  Object.keys(filterCategories).forEach((category) => {
    filterCategories[category].forEach((key) => {
      if (rawKeys.indexOf(key) === -1) {
        rawKeys.push(key);
        suggestions.push({ id: key, text: key, className: category });
      }
    });
  });

  return suggestions;
};

class AdvancedSearch extends Component<Props> {
  state = {
    expandedIndex: null,
    focused: false,
    tooltipShown: false,
  }

  /**
     *  @param {}
     *  add event listeners
  */
  componentDidMount() {
    window.addEventListener('click', this._resetSelectedFilter);
  }

  /**
     *  @param {}
     *  cleanup event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._resetSelectedFilter);
  }

  /**
    @param {number} index
    removes tag from list
  */
  _handleDelete = (index) => {
    const { tags, setTags } = this.props;

    tags.splice(index, 1);

    setTags(tags);
  }

  /**
    @param {String} tag
    @param {String} category
    add tag to list
  */
  _handleAddition = (tag, category) => {
    const { tags, setTags } = this.props;
    if (category) {
      tag.className = category;
    }
    tags.push(tag);

    setTags(tags);
  }

  /**
    @param {}
    add tag to list
  *  @calls {this._handleAddition}
  */
  _addTag = () => {
    // TODO remove use of document.getElementById, use refs and state
    const { value } = this.advancedSearch;
    if (value.length) {
      const tag = {
        id: value,
        text: value,
      };
      this._handleAddition(tag);
    }
  }

  /**
   *  @param {event} evt
   *  resets expanded index state
   *
  */
  _resetSelectedFilter = (evt) => {
    if (evt.target.getAttribute('data-resetselectedfilter-id') !== 'AdvancedSearch__filter-section') {
      this.setState({ expandedIndex: null });
    }
    if (evt.target.getAttribute('data-resetselectedfilter-id') !== 'AdvancedSearch__info') {
      this.setState({ tooltipShown: false });
    }

    // ReactTags class comes from react-tag-input library
    if ((evt.target.getAttribute('data-resetselectedfilter-id') !== 'AdvancedSearch')
      && (evt.target.getAttribute('data-resetselectedfilter-id') !== 'AdvancedSearch__filter-section')
      && (evt.target.className.indexOf('ReactTags') === -1)) {
      this.setState({ focused: false });
    }
  }

  /**
   *  @param {Boolean} tooltipShown
   *  toggles state of tooltipShown
   *  hides/shows tooltip
  */
  _toggleTooltip = (tooltipShown) => {
    this.setState({ tooltipShown });
  }

  /**
   *  @param {Number} expandedIndex
   *  sets expanded index
   *
  */
  _setExpandedIndex = (expandedIndex) => {
    this.setState({ expandedIndex });
  }

  render() {
    const {
      autoHide,
      customStyle,
      filterCategories,
      showButton,
      tags,
      withoutContext,
    } = this.props;
    const {
      expandedIndex,
      focused,
      tooltipShown,
    } = this.state;
    const suggestions = getSuggestions(filterCategories);
    const TagComponent = withoutContext ? WithOutContext : WithContext;

    // declare css here
    const advancedSearchCSS = classNames({
      AdvancedSearch: true,
      'AdvancedSearch--packages': customStyle === 'packages',
      'AdvancedSearch--tagsExist': tags.length,
    });
    const filterCSS = classNames({
      AdvancedSearch__filters: true,
      'AdvancedSearch__filters--dropdown': autoHide,
      hidden: autoHide && !focused,
    });

    return (
      <div
        className={advancedSearchCSS}
      >
        <div className="flex">
          <div className="flex-1">
            <TagComponent
              autocomplete
              autofocus={false}
              data-resetselectedfilter-id="AdvancedSearch"
              handleDelete={(index) => { this._handleDelete(index); }}
              handleAddition={(tag) => { this._handleAddition(tag); }}
              handleInputFocus={() => this.setState({ focused: true })}
              ref={(ref) => { this.advancedSearch = ref; }}
              suggestions={suggestions}
              tags={tags}
              placeholder="Search by keyword, tags or filters"
            />
          </div>
          { showButton
            && (
              <button
                className="Btn Btn__AdvancedSearch"
                onClick={() => this._addTag()}
                type="button"
              />
            )
          }
        </div>
        <div className={filterCSS}>
          { Object.keys(filterCategories).map((category, index) => (
            <Category
              category={category}
              expandedIndex={expandedIndex}
              filterCategories={filterCategories}
              handleAddition={this._handleAddition}
              index={index}
              key={category}
              setExpandedIndex={this._setExpandedIndex}
              toggleTooltip={this._toggleTooltip}
              tooltipShown={tooltipShown}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default AdvancedSearch;
