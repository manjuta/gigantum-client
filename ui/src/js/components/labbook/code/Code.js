// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classNames from 'classnames';
// components
import CodeBrowser from './CodeBrowser';
import CodeFavorites from './CodeFavorites';
import MostRecent from 'Components/labbook/filesShared/MostRecentCode';
import ToolTip from 'Components/shared/ToolTip';
// assets
import './Code.scss';

class Code extends Component {
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
    let selectedFilter = this.props.labbook && this.props.labbook.code && this.props.labbook.code.hasFavorites ? 'favorites' : this.state.selectedFilter;
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
              Code__filter: true,
              'Code__filter--selected': this.state.selectedFilter === 'favorites',
            }),
            recentCSS = classNames({
              Code__filter: true,
              'Code__filter--selected': this.state.selectedFilter === 'recent',
            });

      return (

        <div className="Code">
          { (labbook.code.hasFiles || labbook.code.hasFavorites) &&
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
                  <CodeFavorites
                    codeId={labbook.code.id}
                    labbookId={this.props.labbookId}
                    code={labbook.code}
                  />
                }
                {
                this.state.selectedFilter === 'recent' &&
                  <MostRecent
                    edgeId={labbook.code.id}
                    code={labbook.code}
                    selectedFilter={this.state.selectedFilter}
                  />
                }
              </div>
              <hr />
            </div>
          }
          <div className="Code__file-browser">
            <CodeBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              labbookId={this.props.labbookId}
              codeId={labbook.code.id}
              code={labbook.code}
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
  Code,
  graphql`
    fragment Code_labbook on Labbook{
      code{
        id
        hasFiles
        hasFavorites
        ...CodeBrowser_code
        ...CodeFavorites_code
        ...MostRecentCode_code
      }
    }
  `,
);
