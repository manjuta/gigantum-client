// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
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
      selectedFilter: 'favorites',
    };

    this._setSelectedFiles = this._setSelectedFiles.bind(this);
    this._clearSelectedFiles = this._clearSelectedFiles.bind(this);
    this._loadStatus = this._loadStatus.bind(this);
    this._selectFilter = this._selectFilter.bind(this);
  }

  componentDidUpdate() {
    this.refs[this.state.selectedFilter].classList.add('Code__filter--selected');
    for (const key in this.refs) {
      if (key !== this.state.selectedFilter) {
        this.refs[key].classList.remove('Code__filter--selected');
      }
    }
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
          <div className="Code__header">
            <div className="Code__toolbar">
              <a ref="favorites" className="Code__filter" onClick={() => this._selectFilter('favorites')}>Favorites</a>
              <a ref="recent" className="Code__filter" onClick={() => this._selectFilter('recent')}>Most Recent</a>
            </div>
          </div>
          <div className="Code__files">
            {
            this.state.selectedFilter === 'favorites' &&
            <InputFavorites
              inputId={this.props.labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
            />
          }
            {
            this.state.selectedFilter === 'recent' &&
            <MostRecent
              edgeId={this.props.labbook.input.id}
              input={this.props.labbook.input}
            />
          }
          </div>
          <hr />
          <div className="Code__file-browser Card column-12-1">
            <InputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              inputId={this.props.labbook.input.id}
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
        ...InputDataBrowser_input
        ...InputFavorites_input
        ...MostRecentInput_input
        isUntracked
      }
    }
  `,
);
