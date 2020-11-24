// vendor
import React, { Component } from 'react';
// components
import Loader from 'Components/loader/Loader';
// assets
import './SectionWrapper.scss';

const getComponetPaths = ((props) => {
  const sectionType = props.labbook ? 'labbook' : 'dataset';
  const sectionPathRoot = `${sectionType}`;
  const sectionUpperCase = props.section[0].toUpperCase() + props.section.slice(1);
  const section = ((props.section === 'code') || props.section === 'data') ? props.section : `${props.section}Data`;
  const browserPath = `${sectionPathRoot}/${section}/${sectionUpperCase}Browser`;

  return ({
    browserPath,
  });
});

export default class SectionWrapper extends Component {
  state = {
    selectedFiles: [],
  };

  componentDidMount() {
    const { props } = this;
    const { section } = props;
    props.refetch(section);
  }

  /**
  *  @param {Object} evt
  *  set state with selected filter
  *  @return {}
  */
  _setSelectedFiles = (evt) => {
    const files = [...evt.target.files];
    this.setState({ selectedFiles: files });
  }

  /**
  *  @param {}
  *  clear selected files
  *  @return {}
  */
  _clearSelectedFiles = () => {
    this.setState({ selectedFiles: [] });
  }

  /**
  *  @param {Object} result
  *  udate loading status if state is not the same as result
  *  @return {}
  */
  _loadStatus = (result) => {
    const { state } = this;
    if (result !== state.loadingStatus) {
      this.setState({ loadingStatus: result });
    }
  }

  render() {
    const { selectedFiles } = this.state;
    const {
      containerStatus,
      dataset,
      datasetId,
      isLocked,
      isManaged,
      labbook,
      labbookId,
      lockFileBrowser,
      name,
      owner,
      section,
      uploadAllowed,
    } = this.props;
    const sectionObject = labbook || dataset;
    const innerSection = dataset ? sectionObject : sectionObject[section];
    const {
      browserPath,
    } = getComponetPaths(this.props);

    if (sectionObject) {
      const sectionId = labbookId || datasetId;
      const Browser = require(`./../../../${browserPath}`).default;

      // declare css
      const sectionProps = {
        [section]: innerSection,
      };
      if (!((section === 'data') || (sectionObject[section]))) {
        return <Loader />;
      }

      if (!((section === 'data' && sectionObject.id) || (sectionObject[section]))) {
        return <Loader />;
      }

      return (

        <div className="SectionWrapper">
          {
            (section === 'input')
            && <h4 className="margin-bottom--0 regular">Datasets and Files</h4>
          }
          <div className="grid">
            <div className="SectionWrapper__file-browser column-1-span-12">
              <Browser
                selectedFiles={selectedFiles}
                clearSelectedFiles={this._clearSelectedFiles}
                labbookId={sectionId}
                sectionId={innerSection.id}
                section={section}
                loadStatus={this._loadStatus}
                isLocked={isLocked}
                isManaged={isManaged}
                owner={owner}
                name={name}
                {...sectionProps}
                linkedDatasets={sectionObject.linkedDatasets || null}
                containerStatus={containerStatus}
                lockFileBrowser={lockFileBrowser}
                uploadAllowed={uploadAllowed}
              />
            </div>
          </div>
        </div>
      );
    }
    return (<div>No Files Found</div>);
  }
}
