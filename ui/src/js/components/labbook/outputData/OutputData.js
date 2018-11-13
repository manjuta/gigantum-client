// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classNames from 'classnames';
// components
import OutputDataBrowser from './OutputDataBrowser';
import OutputFavorites from './OutputFavorites';
import MostRecent from 'Components/labbook/filesShared/MostRecentOutput';
import ToolTip from 'Components/shared/ToolTip';
// assets
import './../code/Code.scss';

class OutputData extends Component {
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
    let selectedFilter = this.props.labbook && this.props.labbook.output && this.props.labbook.output.hasFavorites ? 'favorites' : this.state.selectedFilter;
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
  *  @param {object} result
  *  udate loading status if state is not the same as result
  *  @return {}
  */
  _loadStatus(res) {
    if (res !== this.state.loadingStatus) {
      this.setState({ loadingStatus: res });
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
              Code__filter: true,
              'Code__filter--selected': this.state.selectedFilter === 'favoites',
            }),
            recentCSS = classNames({
              Code__filter: true,
              'Code__filter--selected': this.state.selectedFilter === 'recent',
            });

      return (

        <div className="Code">
          {
            this.props.labbook.output.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          { (labbook.output.hasFiles || labbook.output.hasFavorites) &&
            <div>
              <div className="Code__header">
                <div className="Code__toolbar">
                  <a ref="favorites" className={favoritesCSS} onClick={() => this._selectFilter('favorites')}>Favorites</a>
                  <a ref="recent" className={recentCSS} onClick={() => this._selectFilter('recent')}>Most Recent</a>
                </div>
              </div>

              <div className="Code__files">
                {
                this.state.selectedFilter === 'favorites' &&
                  <OutputFavorites
                    outputId={labbook.output.id}
                    labbookId={this.props.labbookId}
                    output={labbook.output}
                  />
                 }
                 {
                  this.state.selectedFilter === 'recent' &&
                    <MostRecent
                      edgeId={labbook.output.id}
                      output={labbook.output}
                    />
                  }
                </div>
              </div>
            }
          <hr />
          <div className="Code__file-browser">
            <OutputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              outputId={labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
              loadStatus={this._loadStatus}
              isLocked={this.props.isLocked}
            />
          </div>
        </div>
      );
    }
    return (<div>No Files Found</div>);
  }
}


export default createFragmentContainer(
  OutputData,
  graphql`
    fragment OutputData_labbook on Labbook {
      output{
        id
        hasFiles
        hasFavorites
        ...OutputDataBrowser_output
        ...OutputFavorites_output
        ...MostRecentOutput_output
        isUntracked
      }
    }
  `,
);
