// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import HorizontalBar from 'Components/visualization/horizontal/HorizontalBar';
// assets
import './Summary.scss';
// config
import config from 'JS/config';

export default class Summary extends PureComponent {
  render() {
    const { props } = this;
    const onDiskBytes = props.localBytes;
    const onDiskFormatted = config.humanFileSize(onDiskBytes);
    const toDownloadBytes = props.totalBytes - props.localBytes;
    const toDownloadFormatted = config.humanFileSize(toDownloadBytes);
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
              <div className="Summary__subheader">Number of Files</div>
              <div className="Summary__content">{props.numFiles}</div>
            </div>
            <div className="Summary__size flex-1">
              <div className="Summary__total-size flex-1">
                <div className="Summary__subheader">Total Size</div>
                <div className="Summary__content">{config.humanFileSize(props.totalBytes)}</div>
              </div>
              <div className={progressCSS}>
                <progress
                  value={onDiskBytes}
                  max={props.totalBytes}
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
              <div className="Summary__subheader">Common File Types</div>
                {
                  (props.fileTypeDistribution.length !== 0)
                  && (
                    <HorizontalBar fileTypeDistribution={props.fileTypeDistribution} />
                  )
                }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
