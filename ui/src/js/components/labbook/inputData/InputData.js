// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classNames from 'classnames';
// components
import InputDataBrowser from './InputDataBrowser';
import InputFavorites from './InputFavorites';
import MostRecent from 'Components/labbook/filesShared/MostRecentInput';
import ToolTip from 'Components/shared/ToolTip';
// store
import store from 'JS/redux/store';
// assets
import './../code/Code.scss';

class InputData extends Component {
  constructor(props) {
  	super(props);
    const { owner, labbookName } = store.getState().routes;

    this.state = {
      owner,
      labbookName,
      selectedFiles: [],
      selectedFilter: 'recent',
    };

    this._setSelectedFiles = this._setSelectedFiles.bind(this);
    this._clearSelectedFiles = this._clearSelectedFiles.bind(this);
    this._loadStatus = this._loadStatus.bind(this);
    this._selectFilter = this._selectFilter.bind(this);
  }

  componentDidMount() {
    let selectedFilter = this.props.labbook && this.props.labbook.input && this.props.labbook.input.hasFavorites ? 'favorites' : this.state.selectedFilter;
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
  *  @param { result }
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
            this.props.labbook.input.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          { (labbook.input.hasFiles || labbook.input.hasFavorites) &&
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
                  <InputFavorites
                    inputId={labbook.input.id}
                    labbookId={this.props.labbookId}
                    input={labbook.input}
                  />
                }
                {
                this.state.selectedFilter === 'recent' &&
                  <MostRecent
                    edgeId={labbook.input.id}
                    input={labbook.input}
                  />
                }
              </div>
              <hr />
            </div>
          }
          <div className="Code__file-browser Card column-12-1">
            <InputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              inputId={labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
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
  InputData,
  graphql`
    fragment InputData_labbook on Labbook {
      input{
        id
        hasFiles
        hasFavorites
        ...InputDataBrowser_input
        ...InputFavorites_input
        ...MostRecentInput_input
        isUntracked
      }
    }
  `,
);
