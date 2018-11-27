// vendor
import React, { Component } from 'react';
import classNames from 'classnames';

// assets
import './SectionWrapper.scss';

export default class SectionWrapper extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      selectedFiles: [],
      selectedFilter: 'recent',
    };
    this._setSelectedFiles = this._setSelectedFiles.bind(this);
    this._clearSelectedFiles = this._clearSelectedFiles.bind(this);
    this._loadStatus = this._loadStatus.bind(this);
    this._selectFilter = this._selectFilter.bind(this);
  }

  componentDidMount() {
    let selectedFilter = this.props.labbook && this.props.labbook[this.props.section] && this.props.labbook[this.props.section].hasFavorites ? 'favorites' : this.state.selectedFilter;
    this.setState({ selectedFilter });
  }

  /**
  *  @param {Object}
  *  set state with selected filter
  *  @return {}
  */
  _setSelectedFiles(evt) {
    const files = [...evt.target.files];
    this.setState({ selectedFiles: files });
  }

  /**
  *  @param {}
  *  clear selected files
  *  @return {}
  */
  _clearSelectedFiles() {
    this.setState({ selectedFiles: [] });
  }

  /**
  *  @param {result}
  *  udate loading status if state is not the same as result
  *  @return {}
  */
  _loadStatus(result) {
    if (result !== this.state.loadingStatus) {
      this.setState({ loadingStatus: result });
    }
  }

  /**
  *  @param {string} filterName - Filter for favorites & most recent view.
  *  update filterName and toggle view
  *  @return {}
  */
  _selectFilter(filterName) {
    this.setState({ selectedFilter: filterName });
  }

  render() {
    if (this.props.labbook) {
      const { labbook } = this.props,
            favoritesCSS = classNames({
              SectionWrapper__filter: true,
              'SectionWrapper__filter--selected': this.state.selectedFilter === 'favorites',
            }),
            recentCSS = classNames({
              SectionWrapper__filter: true,
              'SectionWrapper__filter--selected': this.state.selectedFilter === 'recent',
            }),
            capitalSection = this.props.section[0].toUpperCase() + this.props.section.slice(1),
            Favorites = require(`../favorites/favoritesContainers/${capitalSection}Favorites`).default,
            MostRecent = require(`../mostRecent/mostRecentContainers/MostRecent${capitalSection}`).default,
            Browser = require(`../sectionBrowser/sectionBrowserContainers/${capitalSection}Browser`).default,
            sectionProps = {
                [this.props.section]: this.props.labbook && this.props.labbook[this.props.section],
                }

      return (

        <div className="SectionWrapper">
          {
            this.props.labbook[this.props.section].isUntracked &&
            <div className="SectionWrapper__tracked-container">
              <div className="SectionWrapper__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          { (labbook[this.props.section].hasFiles || labbook[this.props.section].hasFavorites) &&
            <div>
              <div className="SectionWrapper__header">
                <div className="SectionWrapper__toolbar">
                  <a ref="favorites" className={favoritesCSS} onClick={() => this._selectFilter('favorites')}>Favorites</a>
                  <a ref="recent" className={recentCSS} onClick={() => this._selectFilter('recent')}>Most Recent</a>
                </div>

              </div>

              <div className="SectionWrapper__files">
                {
                this.state.selectedFilter === 'favorites' &&
                <Favorites
                    sectionId={this.props.labbook[this.props.section].id}
                    labbookId={this.props.labbookId}
                    section={this.props.section}
                    {...sectionProps}
                />
                }
                {
                this.state.selectedFilter === 'recent' &&
                  <MostRecent
                    edgeId={labbook[this.props.section].id}
                    selectedFilter={this.state.selectedFilter}
                    section={this.props.section}
                    {...sectionProps}

                  />
                }
              </div>
              <hr />
            </div>
          }
          <div className="SectionWrapper__file-browser">
            <Browser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              labbookId={this.props.labbookId}
              sectionId={labbook[this.props.section].id}
              section={this.props.section}
              loadStatus={this._loadStatus}
              isLocked={this.props.isLocked}
              {...sectionProps}
            />
          </div>
        </div>
      );
    }
    return (<div>No Files Found</div>);
  }
}
