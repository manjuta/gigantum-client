// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
// store
import { setInfoMessage } from 'JS/redux/actions/footer';
// context
import ServerContext from 'Pages/ServerContext';
// css
import './CopyUrl.scss';

type Props = {
  defaultRemote: string,
  name: string,
  owner: string,
  remoteUrl: string,
  showExport: boolean,
};

class CopyUrl extends Component<Props> {
  /**
  *  @param {}
  *  copies remote
  *  @return {}
  */
  _copyRemote = () => {
    const {
      owner,
      name,
    } = this.props;
    const copyText = document.getElementById('ActionsMenu-copy');
    copyText.select();

    document.execCommand('Copy');

    setInfoMessage(owner, name, `${copyText.value} copied!`);
  }

  static contextType = ServerContext;

  render() {
    const {
      defaultRemote,
      name,
      owner,
      remoteUrl,
      showExport,
    } = this.props;
    const { currentServer } = this.context;
    const { baseUrl } = currentServer;
    const doesNotHaveRemote = (defaultRemote === null) && (remoteUrl === null);
    const text = showExport ? 'Export Path' : 'Get Share URL';
    const copyValue = showExport ? remoteUrl : `${baseUrl}${owner}/${name}`;
    // declare css here
    const copyUrlCSS = classNames({
      'ActionsMenu__item ActionsMenu__item--copy': true,
      'CopyUrl--export': showExport,
      'CopyUrl--disabled': doesNotHaveRemote,
    });

    return (
      <li
        className="CopyUrl"
        data-tip="Project needs to be published before it can be shared"
        data-for="Tooltip--noCache"
      >
        <div
          className={copyUrlCSS}
        >
          <div className="ActionsMenu__item--label">{text}</div>
          <div className="ActionsMenu__copyRemote">

            <input
              className="ActionsMenu__input"
              disabled={doesNotHaveRemote}
              id="ActionsMenu-copy"
              readOnly
              type="text"
              value={copyValue}
            />

            <button
              disabled={doesNotHaveRemote}
              onClick={() => this._copyRemote()}
              className="CopyUrl__btn--copy fa fa-clone"
              type="button"
            />
          </div>
        </div>


        { doesNotHaveRemote
          && (
            <ReactTooltip
              place="top"
              id="Tooltip--noCache"
              delayShow={500}
            />
          )}
      </li>
    );
  }
}

export default CopyUrl;
