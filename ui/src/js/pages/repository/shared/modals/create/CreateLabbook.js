// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// utilities
import validation from 'JS/utils/Validation';
// components
import LoginPrompt from 'Pages/repository/shared/modals/LoginPrompt';
// queries
import RepositoryNameIsAvailable from './queries/RepositoryNameIsAvailableQuery';
// assets
import './CreateLabbook.scss';


type Props = {
  createLabbookCallback: Function,
  datasets: Array<Object>,
  setButtonState: Function,
  toggleDisabledContinue: Function,
};

class CreateLabbook extends React.Component<Props> {
  state = {
    name: '',
    description: '',
    showError: false,
    errorType: '',
    textWarning: 'CreateLabbook__warning--green',
    textLength: 80,
    showLoginPrompt: false,
  };

  /**
  *   @param {} -
  *   takes an event input
  *   creates a labbook mutation sets labbook name on parent component
  *   triggers setComponent to proceed to next view
  * */
  continueSave = () => {
    const {
      createLabbookCallback,
      setButtonState,
    } = this.props;
    const { name, description } = this.state;

    setButtonState('loading');

    RepositoryNameIsAvailable.checkRespositoryName(name).then((response) => {
      if (response.data.repositoryNameIsAvailable) {
        createLabbookCallback(name, description);
        setButtonState('');
      } else {
        this.setState({
          name: '',
          showError: true,
          errorType: 'validation',
        });
        setButtonState('');
        this.createLabbookName.focus();
      }
    }).catch((error) => {
      setButtonState('error');
    });
  }

  /**
  *  @param {}
  *  closes login prompt modal
  *  @return {}
  */
  _closeLoginPromptModal = () => {
    this.setState({ showLoginPrompt: false });
  }

  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState = (evt, field) => {
    const state = {};
    const { toggleDisabledContinue } = this.props;

    state[field] = evt.target.value;

    if (field === 'name') {
      const isMatch = validation.labbookName(evt.target.value);
      this.setState({
        showError: ((isMatch === false) && (evt.target.value.length > 0)),
        errorType: '',
      });

      toggleDisabledContinue((evt.target.value === '') || (isMatch === false));
    } else {
      const textLength = 80 - evt.target.value.length;
      if (textLength > 21) {
        state.textWarning = 'CreateLabbook__warning--green';
      } else if ((textLength <= 21)) {
        state.textWarning = 'CreateLabbook__warning--orange';
      }
      state.textLength = textLength;
    }

    this.setState(state);
  }

  /**
    @param {}
    returns error message
    @return {string} errorMessage
  */
  _getErrorText() {
    switch (this.state.errorType) {
      case 'send':
        return 'Error: Last character cannot be a hyphen.';
      case 'validation':
        return 'Name is already in use, please enter another name.';
      default:
        return 'Error: Title may only contain lowercase alphanumeric and `-`. (e.g. lab-book-title)';
    }
  }

  render() {
    const { datasets } = this.props;
    const {
      showError,
      showLoginPrompt,
      textLength,
      textWarning,
    } = this.state;
    const type = datasets ? 'Dataset' : 'Project';
    // declare css here
    const inputCSS = classNames({
      invalid: showError,
    });
    const errorSpanCSS = classNames({
      error: showError,
      hidden: !showError,
    });

    return (
      <div className="CreateLabbook">
        <LoginPrompt
          showLoginPrompt={showLoginPrompt}
          closeModal={this._closeLoginPromptModal}
        />
        <div>
          <div className="CreateLabbook__name">
            <label htmlFor="CreateLabbookName">
              Title
              <input
                ref={(input) => { this.createLabbookName = input; }}
                id="CreateLabbookName"
                type="text"
                maxLength="36"
                className={inputCSS}
                onChange={evt => this._updateTextState(evt, 'name')}
                placeholder="Enter a unique, descriptive title"
              />
            </label>
            <span className={errorSpanCSS}>
              {this._getErrorText()}
            </span>
          </div>

          <div className="CreateLabbook__description">
            <label htmlFor="CreateLabbookDescription">
              Description
              <textarea
                id="CreateLabbookDescription"
                maxLength="80"
                className="CreateLabbook__description-input"
                type="text"
                onChange={evt => this._updateTextState(evt, 'description')}
                placeholder={`Briefly describe this ${type}, its purpose and any other key details.`}
              />
            </label>

            <p className={`CreateLabbook__warning ${textWarning}`}>
              {`${textLength} characters remaining`}
            </p>
          </div>

        </div>
      </div>
    );
  }
}

export default CreateLabbook;
