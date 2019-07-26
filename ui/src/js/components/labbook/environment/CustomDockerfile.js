// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import uuidv4 from 'uuid/v4';
// mutations
import AddCustomDockerMutation from 'Mutations/AddCustomDockerMutation';
import SetBundledAppMutation from 'Mutations/environment/SetBundledAppMutation';
import RemoveBundledAppMutation from 'Mutations/environment/RemoveBundledAppMutation';
// store
import store from 'JS/redux/store';
import { setContainerMenuWarningMessage } from 'JS/redux/actions/labbook/environment/environment';
// config
import { setErrorMessage, setWarningMessage } from 'JS/redux/actions/footer';
import config from 'JS/config';
// Components
import Tooltip from 'Components/common/Tooltip';
import CustomDockerfileEditor from './CustomDockerfileEditor';
import CustomApplicationButton from './CustomApplicationButton';
// assets
import './CustomDockerfile.scss';

export default class CustomDockerfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalDockerfile: this.props.dockerfile,
      dockerfileContent: this.props.dockerfile,
      lastSavedDockerfileContent: this.props.dockerfile,
      savingDockerfile: false,
      customAppFormList: [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.dockerfile !== state.originalDockerfile) {
      return {
        ...state,
        originalDockerfile: props.dockerfile,
        dockerfileContent: props.dockerfile,
        lastSavedDockerfileContent: props.dockerfile,
      };
    }
    return state;
  }

  /**
  *  @param {}
  *  appds to customAppFormList in state
  *  @return {}
  */
  _addCustomAppForm = () => {
    const { state } = this;
    const newCustomAppFormList = state.customAppFormList.slice();
    const key = uuidv4();
    newCustomAppFormList.push({
      key,
      portNumber: '',
      command: '',
      name: '',
      description: '',
    });
    this.setState({ customAppFormList: newCustomAppFormList });
  }

  /**
  *  @param {Integer} index
  *  @param {String} fieldName
  *  @param {Event} evt
  *  showCustomAppForm set to true in state
  *  @return {}
  */
  _modifyCustomApp = (index, fieldName, evt) => {
    const { state } = this;
    const newCustomAppFormList = state.customAppFormList.slice();
    if (fieldName === 'remove') {
      newCustomAppFormList.splice(index, 1);
    } else {
      newCustomAppFormList[index][fieldName] = evt.target.value;
    }
    this.setState({ customAppFormList: newCustomAppFormList });
  }

  /**
  *  @param {String} owner
  *  @param {String} labbookName
  *  @param {Object} formData
  *  @param {Boolean} isLast
  *  fires SetBundledAppMutation
  *  @return {}
  */
  _setBundledApp = (owner, labbookName, formData, isLast) => {
    const { props, state } = this;
    SetBundledAppMutation(
      owner,
      labbookName,
      formData.portNumber,
      formData.name,
      formData.description,
      formData.command,
      (response, error) => {
        console.log(response, error);
        if (isLast) {
          props.buildCallback();
          this.setState({ customAppFormList: [], lastSavedDockerfileContent: state.dockerfileContent, savingDockerfile: false });
        }
      },
    );
  }

  /**
  *  @param {appName} string
  *  fires RemoveBundledAppMutation
  *  @return {}
  */
  _removeBundledApp = (appName) => {
    const { props } = this;
    RemoveBundledAppMutation(
      props.owner,
      props.name,
      appName,
      (response, error) => {
        console.log(response, error);
      },
    );
  }

  /**
  *  @param {}
  *  updates docker file
  *  @return {}
  */
  _saveDockerfile() {
    const { props, state } = this;


    const { status } = store.getState().containerStatus;


    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !props.isLocked;


    const { owner, labbookName } = store.getState().routes;

    if (navigator.onLine) {
      if (canEditEnvironment) {
        const validDictionary = new Set(['LABEL', 'RUN', 'ENV', '#']);
        const splitDockerSnippet = this.state.dockerfileContent.split(/\n|\\n/);
        let valid = true;
        splitDockerSnippet.forEach((snippetLine, index) => {
          const firstVal = snippetLine.split(' ')[0];
          const previousLine = splitDockerSnippet[index - 1] && splitDockerSnippet[index - 1];
          let isPreviousLineExtended = false;

          if (previousLine) {
            const strippedSpaces = previousLine.split(' ').join('');
            isPreviousLineExtended = strippedSpaces[strippedSpaces.length - 1] === '\\';
          }

          if ((firstVal.length && !validDictionary.has(firstVal.toUpperCase()) && firstVal[0] !== '#') && !isPreviousLineExtended) {
            valid = false;
          }
        });

        if (valid) {
          this.setState({ savingDockerfile: true });

          AddCustomDockerMutation(
            owner,
            labbookName,
            this.state.dockerfileContent,
            (res, error) => {
              if (error) {
                console.log(error);
                setErrorMessage('Dockerfile was not set: ', error);
                this.setState({ savingDockerfile: false });
              } else {
                state.customAppFormList.forEach((data, index) => {
                  const isLast = index === (state.customAppFormList.length - 1);
                  this._setBundledApp(owner, labbookName, data, isLast);
                });
              }
            },
          );
        } else {
          setWarningMessage('Invalid command entered. Commands must begin with: LABEL, RUN, ENV, or #');
        }
      } else {
        setContainerMenuWarningMessage('Stop Project before editing the environment. \n Be sure to save your changes.');
      }
    } else {
      setErrorMessage('Cannot remove package at this time.', [{ message: 'An internet connection is required to modify the environment.' }]);
    }
  }

  render() {
    const { props, state } = this;
    const dockerfileCSS = classNames({
      CustomDockerfile__block: true,
      empty: !this.state.dockerfileContent,
    });
    let dockerFileNotChanged = state.dockerfileContent === state.lastSavedDockerfileContent;
    state.customAppFormList.forEach((appForm) => { dockerFileNotChanged = !(appForm.portNumber !== '' && appForm.name !== ''); });

    return (
      <div className="CustomDockerfile">

        <div className="Environment__headerContainer">

          <h4>
            Custom Docker Instructions
            <Tooltip section="dockerInstructionsEnvironment" />
          </h4>

        </div>

        <div className="CustomDockerfile__sub-header">

          <p>Add commands below to modify your environment. Note: Docker instructions are executed after packages are installed.</p>

          <div className="CustomDockerfile--code-snippet flex">
            <p>For example, to install a pip package from a Github repo add:</p>
            <code>RUN pip install git+https://git.repo/some_pkg.git</code>
          </div>

        </div>
        <div className="grid">
          <div className="CustomDockerfile__content Card Card--auto Card--no-hover column-1-span-12">
            <div className="flex">

              <div className={dockerfileCSS}>
                <CustomDockerfileEditor
                  dockerfileContent={state.dockerfileContent}
                  addCustomAppForm={this._addCustomAppForm}
                  customAppFormList={state.customAppFormList}
                  lastSavedDockerfileContent={state.lastSavedDockerfileContent}
                  modifyCustomApp={this._modifyCustomApp}
                  bundledApps={props.bundledApps}
                  removeBundledApp={this._removeBundledApp}
                  handleChange={(code) => { this.setState({ dockerfileContent: code }); }}
                />
              </div>
              <div className="flex flex--column CustomDockerfile__draggables">
                <CustomApplicationButton />
              </div>
            </div>
            <div className="CustomDockerfile__buttonContainer">
              <button
                onClick={() => this.setState({ customAppFormList: [], dockerfileContent: state.lastSavedDockerfileContent })}
                className="CustomDockerfile__content-cancel-button Btn--flat"
                type="button"
                disabled={dockerFileNotChanged}
              >
                Cancel
              </button>
              <button
                disabled={state.savingDockerfile || dockerFileNotChanged}
                onClick={() => this._saveDockerfile()}
                className="CustomDockerfile__content-save-button Btn--last"
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
