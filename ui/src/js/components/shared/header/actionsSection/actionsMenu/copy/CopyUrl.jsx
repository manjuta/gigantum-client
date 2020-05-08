// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
// store
import { setInfoMessage } from 'JS/redux/actions/footer';
// css
import './CopyUrl.scss';

type Props = {
  defaultRemote: string,
  name: string,
  owner: string,
  remoteUrl: string,
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

  render() {
    const {
      defaultRemote,
      name,
      owner,
      remoteUrl,
    } = this.props;
    const doesNotHaveRemote = (defaultRemote === null) && (remoteUrl === null);

    // declare css here
    const copyUrlCSS = classNames({
      'ActionsMenu__item ActionsMenu__item--copy': true,
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
          <div className="ActionsMenu__item--label">Get Share URL</div>
          <div className="ActionsMenu__copyRemote">

            <input
              id="ActionsMenu-copy"
              className="ActionsMenu__input"
              defaultValue={`gigantum.com/${owner}/${name}`}
              disabled={doesNotHaveRemote}
              type="text"
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
          )
        }
      </li>
    );
  }
}

export default CopyUrl;
