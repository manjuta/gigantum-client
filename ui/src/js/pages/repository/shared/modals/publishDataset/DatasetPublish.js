// @flow
// vendor
import React from 'react';
import classNames from 'classnames';

type Props = {
  isProcessing: Boolean,
  localDataset: {
    name: string,
    owner: string,
  },
  progress: Object,
  setPublic: Function,
}

const DatasetPublish = (props: Props) => {
  const {
    isProcessing,
    localDataset,
    progress,
    setPublic,
  } = props;
  const name = `${localDataset.owner}/${localDataset.name}`;
  const currentStepProgress = progress[name] ? progress[name].step : 2;
  const firstStepCSS = classNames({
    'is-active': currentStepProgress === 1,
    'is-completed': currentStepProgress > 1,
  });
  const secondStepCSS = classNames({
    'is-active': currentStepProgress === 2,
    'is-completed': currentStepProgress > 2,
  });
  const thirdStepCSS = classNames({
    'is-active': currentStepProgress === 3,
    'is-completed': currentStepProgress > 3,
  });
  const fourthStepCSS = classNames({
    'is-completed': currentStepProgress === 4,
  });
  return (
    <li
      key={name}
      className="flex"
    >
      {name}
      <div className="PublishDatasetsModal__Datasets-radio-container">
        { (!isProcessing)
          ? (
            <>
              <div className="PublishDatasetsModal__private">
                <label
                  htmlFor={`${name}_private`}
                  className="Radio"
                >
                  <input
                    type="radio"
                    name={name}
                    id={`${name}_private`}
                    onClick={() => { setPublic(name, false); }}
                  />
                  <span><b>Private</b></span>
                </label>
              </div>
              <div className="PublishDatasetsModal__public">
                <label
                  htmlFor={`${name}_public`}
                  className="Radio"
                >
                  <input
                    type="radio"
                    name={name}
                    id={`${name}_public`}
                    onClick={() => { setPublic(name, true); }}
                  />
                  <span><b>Public</b></span>
                </label>
              </div>
            </>
          )
          : (
            <div className="container-fluid">
              <ul className="list-unstyled multi-steps">
                <li className={firstStepCSS}>Publishing</li>
                <li className={secondStepCSS}>Unlinking</li>
                <li className={thirdStepCSS}>Relinking</li>
                <li className={fourthStepCSS}>Finished</li>
              </ul>
            </div>
          )}

      </div>
    </li>
  );
};

export default DatasetPublish;
