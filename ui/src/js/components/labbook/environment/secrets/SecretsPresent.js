// @flow
// vendor
import React, { PureComponent } from 'react';

type Props = {
  setTooltipVisible: Function,
  node: {
    filename: string
  },
  tooltipVisible: string, // not a good name for this variable
}

class SecretsPresent extends PureComponent<Props> {
  render() {
    const {
      setTooltipVisible,
      node,
      tooltipVisible,
    } = this.props;
    return (
      <button
        type="button"
        className="Btn margin-right--grid Btn--small Btn--round Btn__warning relative"
        onClick={() => setTooltipVisible(node.filename)}
      >
        {
        (tooltipVisible === node.filename)
        && (
        <div className="InfoTooltip">
          Secrets file not found. Edit to replace file.
          {' '}
          <a
            target="_blank"
            href="https://docs.gigantum.com/docs/managing-secrets"
            rel="noopener noreferrer"
          >
            Learn more.
          </a>
        </div>
        )
      }
      </button>
    );
  }
}

export default SecretsPresent;
