// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// context
import ServerContext from 'Pages/ServerContext';

class DatasetsCommits extends PureComponent {
  state = {
    popupVisible: false,
    tooltipVisible: false,
  }

  componentDidMount() {
    window.addEventListener('click', this._closeTooltip);
    window.addEventListener('click', this._closePopup);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._closeTooltip);
    window.removeEventListener('click', this._closePopup);
  }

  /**
   * @param {} -
   * closes tooltips
   */
  _closeTooltip = (evt) => {
    const dataId = evt.target.getAttribute('data-id');
    if (dataId !== 'commits-tooltip') {
      this.setState({ tooltipVisible: false });
    }
  }

  /**
   * @param {} -
   * closes popups
   */
  _closePopup = (evt) => {
    const dataId = evt.target.getAttribute('data-id');
    if (dataId !== 'commits-popup') {
      this.setState({ popupVisible: false });
    }
  }

  /**
   * @param {Object} evt
   * remove dataset or update link
   */
  _toggleTooltip = () => {
    this.setState((state) => {
      const tooltipVisible = !state.tooltipVisible;
      return { tooltipVisible };
    });
  }

  _togglePopup = () => {
    this.setState((state) => {
      const popupVisible = !state.popupVisible;
      return { popupVisible };
    });
  }

  /**
   * @param {Object} evt
   * remove dataset or update link
   */
  _confirmPopup = (evt) => {
    const {
      modifiyDatasetLink,
      commitsBehind,
    } = this.props;
    if (commitsBehind === null) {
      modifiyDatasetLink(evt, 'unlink');
    } else {
      modifiyDatasetLink(evt, 'update');
    }

    this.setState({ popupVisible: false });
  }

  static contextType = ServerContext;

  render() {
    const { state } = this;
    const {
     commitsPending,
     commitsBehind,
     togglePopup,
     tooltipShown,
     toggleTooltip,
     isLocked,
    } = this.props;
    const { currentServer } = this.context;
    const LinkText = (commitsBehind === null)
      ? `This Dataset has been deleted from ${currentServer.name}. Click to unlink.`
      : 'Link to Latest Version';
    const infoText = (commitsBehind === null)
      ? `This Dataset has been removed from ${currentServer.name}, you can no longer download or sync this dataset. Unlinking this dataset is recommended.`
      : `Dataset link is ${commitsBehind} commits behind. Select "Link to latest version" to update to the latest dataset version.`;
    // declare css here
    const commitsCSS = classNames({
      DatasetCard__commits: true,
      'DatasetCard__commits--info': (commitsBehind === null),
      'DatasetCard__commits--loading': commitsPending,
    });
    const commitsPopupCSS = classNames({
      DatasetCard__popup: true,
      hidden: !state.popupVisible || isLocked,
      Tooltip__message: true,
    });
    return (
      <div className="DatasetsCard__commitsContainer flex justify--left align-items--center">
        <div className={commitsCSS}>
          {!commitsPending
            && <div className="DatasetCard__commits--commits-behind">{commitsBehind}</div>
          }
        </div>
        <div className="relative">
          <button
            className="Btn Btn--flat"
            type="button"
            data-id="commits-popup"
            onClick={() => { this._togglePopup(); }}
            disabled={commitsPending}
          >
            {LinkText}
          </button>
          <div className={commitsPopupCSS}>
            <div className="Tooltip__pointer" />
            <p className="margin-top--0">Are you sure?</p>
            <div className="flex justify--space-around">
              <button
                className="File__btn--round File__btn--cancel"
                data-id="commits-popup"
                onClick={() => { this._togglePopup(); }}
                type="button"
              />
              <button
                className="File__btn--round File__btn--add"
                data-id="commits-popup"
                onClick={(evt) => { this._confirmPopup(evt); }}
                type="button"
              />
            </div>
          </div>
        </div>
        <button
          className="DatasetCard__tooltip"
          onClick={() => this._toggleTooltip()}
          data-id="commits-tooltip"
          type="button"
        >
          { state.tooltipVisible
            && (
              <div className="InfoTooltip">
                { infoText }
                {' '}
                <a
                  target="_blank"
                  href="https://docs.gigantum.com/docs/using-datasets-with-projects"
                  rel="noopener noreferrer"
                >
                  Learn more.
                </a>
              </div>
            )
          }
        </button>
      </div>
    );
  }
}

export default DatasetsCommits;
