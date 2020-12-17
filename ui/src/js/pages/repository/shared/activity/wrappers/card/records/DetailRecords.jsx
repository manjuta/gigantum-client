// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import Record from './record/Record';
// assets
import './DetailRecords.scss';


type Props = {
  detailRecords: Array,
  isNote: Boolean,
};

class DetailRecords extends Component<Props> {
  state = {
    showingMore: false,
    hasOverflow: false,
  }

  /**
   * Lifecycle methods start
   */
  componentDidMount() {
    const self = this;
    setTimeout(() => {
      self._getOverflow();
    }, 100);
    window.addEventListener('resize', this._getOverflow.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._getOverflow.bind(this));
  }

  /**
   * Method specifies whether a container is overflowing with content
   * @param {}
   * @return {}
   */
  _getOverflow = () => {
    this.setState(() => {
      const hasOverflow = (this.recordList.clientHeight + 3) < this.recordList.scrollHeight;
      return { hasOverflow };
    });
  }

  /**
  *  Method sets state on component when user clicks more or less button
  *  @param {}
  *  @return {}
  */
  _moreClicked = () => {
    this.setState((state) => {
      const showingMore = !state.showingMore;
      return { showingMore };
    });
  }

  render() {
    const { detailRecords, isNote } = this.props;
    const { hasOverflow, showingMore } = this.state;
    const toggleLinkText = showingMore ? 'Less...' : 'More...';
    const isImage = detailRecords[0] && detailRecords[0]
      && detailRecords[0].data && detailRecords[0].data[0]
      && detailRecords[0].data[0][0]
      && detailRecords[0].data[0][0].indexOf('image') > -1;
    const listCSS = classNames({
      DetailsRecords__list: true,
      'DetailsRecords__list--long': showingMore || (isImage) || isNote,
    });
    const linkCSS = classNames({
      DetailsRecords__link: !showingMore,
      'DetailsRecords__link-clicked': showingMore,
    });

    return (
      <div className="DetailsRecords">
        <div
          className={listCSS}
          ref={(ref) => { this.recordList = ref; }}
        >
          { detailRecords.map((detailRecord) => (
            <Record
              detailRecord={detailRecord}
              isNote={isNote}
              key={detailRecord.id}
            />
          ))}
        </div>

        { hasOverflow && (!isImage)
          && (
            <div className="">
              { !showingMore && <div className="DetailsRecords__fadeout" /> }
              <p
                className={linkCSS}
                onClick={e => this._moreClicked(e.target)}
                role="presentation"
              >
                {toggleLinkText}
              </p>
            </div>
          )}
      </div>
    );
  }
}

export default DetailRecords;
