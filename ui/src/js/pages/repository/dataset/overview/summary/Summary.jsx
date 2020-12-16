// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
import HorizontalBar from 'Components/visualization/horizontal/HorizontalBar';
// assets
import './Summary.scss';
// config
import config from 'JS/config';


type Props = {
  fileTypeDistribution: Array,
  localBytes: Number,
  numFiles: Number,
  totalBytes: Number,
};

const Summary = ({
  fileTypeDistribution,
  localBytes,
  numFiles,
  totalBytes,
}: Props) => {
  const onDiskFormatted = config.humanFileSize(localBytes);
  const toDownloadBytes = ((totalBytes - localBytes) > 0)
    ? (totalBytes - localBytes)
    : 0;
  const toDownloadFormatted = config.humanFileSize(toDownloadBytes);
  // declare css here
  const progressCSS = classNames({
    'Summary__disk-size flex-1 flex flex--column': true,
    'Summary__disk-size--downloaded': toDownloadBytes === 0,
  });

  return (
    <div className="Summary">
      <div className="Overview__container">
        <h2> Summary </h2>
      </div>
      <div className="grid">
        <div className="Summary__card Card column-1-span-12">
          <div className="Summary__file-count">
            <h5 className="Summary__subheader">Number of Files</h5>
            <div className="Summary__content">{numFiles}</div>
          </div>
          <div className="Summary__size flex-1">
            <div className="Summary__total-size flex-1">
              <h5 className="Summary__subheader">Total Size</h5>
              <div className="Summary__content">{config.humanFileSize(totalBytes)}</div>
            </div>
            <div className={progressCSS}>
              <progress
                value={localBytes}
                max={totalBytes}
              />
              <div className="flex justify--space-between">
                <div className="Summary__onDisk flex flex--column">
                  <div className="Summary__onDisk--primary">{onDiskFormatted}</div>
                  <div className="Summary__onDisk--secondary">on disk</div>
                </div>
                {
                  (toDownloadBytes !== 0)
                  && (
                  <div className="Summary__toDownload flex flex--column">
                    <div className="Summary__toDownload--primary">{toDownloadFormatted}</div>
                    <div className="Summary__toDownload--secondary">to download</div>
                  </div>
                  )
                }
              </div>
            </div>
          </div>
          <div className="Summary__file-type">
            <h5 className="Summary__subheader">Common File Types</h5>
            { (fileTypeDistribution.length !== 0)
              && (
                <HorizontalBar fileTypeDistribution={fileTypeDistribution} />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
