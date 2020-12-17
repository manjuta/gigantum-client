// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// component
import RenderDetail from './RenderDetail';
// css
import './Record.scss';

type Props = {
  detailRecord: {
    action: string,
    data: Array<Object>,
    id: string,
    type: string,
  },
}

const Record = (props: Props) => {
  const { detailRecord } = props;
  const {
    action,
    data,
    id,
  } = detailRecord;
  const isNote = (detailRecord.type === 'NOTE');
  // declare cs here
  const liCSS = classNames({
    'Record--note': isNote,
    Record: !isNote,
  });
  const containerCSS = classNames({
    'Record__container note': isNote,
    Record__container: !isNote,
  });

  return (
    <ul className={containerCSS} key={id}>
      {(!isNote) && (
        <div
          className={`Record__action Record__action--${action && action.toLowerCase()}`}
        />
      )}

      { data && data.map((item, index) => {
        const recordType = (index === 0)
          ? 'type'
          : 'data';
        const key = `${id}_${recordType}`;

        return (
          <li
            className={liCSS}
            key={key}
          >
            <RenderDetail
              item={item}
              isNote={isNote}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default Record;
