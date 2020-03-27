// vendor
import React, { PureComponent } from 'react';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import MiddleTruncate from 'react-middle-truncate/lib/react-middle-truncate';
// assets

type Props = {
  section: string,
  action: Function,
  name: string,
  filterText: string,
};

class RepositoryTitle extends PureComponent<Props> {
  render() {
    const {
      section,
      action,
      name,
      filterText,
    } = this.props;

    return (
      <h5
        role="presentation"
        className={`${section}__panel-title`}
        onClick={action}
        data-tip={name}
        data-for={`${section}--${name}`}
      >
        {
          filterText
          && (
            <Highlighter
              highlightClassName={`${section}__highlighted`}
              searchWords={[filterText]}
              autoEscape={false}
              caseSensitive={false}
              textToHighlight={name}
            />
          )
        }
        {
          !filterText
          && (
            <MiddleTruncate
              ellipsis="..."
              text={name}
              smartCopy
            />
          )
        }
        <ReactTooltip
          place="bottom"
          id={`${section}--${name}`}
          delayShow={500}
        />
      </h5>
    );
  }
}

export default RepositoryTitle;
