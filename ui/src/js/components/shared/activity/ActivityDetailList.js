// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import DetailRecords from './DetailRecords';


const showDetail = (props) => {
  const { categorizedDetails, itemKey } = props;
  return (categorizedDetails.detailObjects[itemKey][0].show);
};

export default class ActivityDefaultList extends Component {
  state = {
    show: showDetail(this.props),
    showDetails: this.props.show,
  };

  /**
  *   @param {}
  *  reverse state of showExtraInfo
  */
  _toggleDetailsList = () => {
    this.setState((state) => {
      const show = !state.show;
      return { show };
    });
  }

  /**
   * @param {}
   * restarts refetch
   * @return {}
   */
  _toggleDetailsView = () => {
    const { props } = this;
    this.setState({ showDetails: true });
    props.hideElipsis();
  }

  /**
    @param {string} key
    formats key into a title
    @return {string}
  */
  _formatTitle = (key) => {
    const { props } = this;
    const tempTitle = key.split('_').join(' ') && key.split('_').join(' ').toLowerCase();
    let title = tempTitle.charAt(0) && tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);
    title = title === 'Labbook' ? 'Project' : title;
    return `${title} (${props.categorizedDetails.detailObjects[props.itemKey].length})`;
  }

  render() {
    const { props, state } = this;
    const keys = props.categorizedDetails.detailKeys[props.itemKey];
    const type = props.categorizedDetails.detailObjects[props.itemKey][0].type.toLowerCase();
    // decalre css here
    const activityDetailsCSS = classNames({
      ActivityDetail__details: true,
      note: type === 'note',
    });
    const activityDetailTitleCSS = classNames({
      'ActivityDetail__details-title': true,
      'ActivityDetail__details-title--open': state.show,
      'ActivityDetail__details-title--closed': !state.show,
    });
    return (

      <div className={activityDetailsCSS}>
        { state.showDetails && (type !== 'note')
          ? (
            <div
              onClick={() => { this._toggleDetailsList(); }}
              className={activityDetailTitleCSS}
            >
              <div className="ActivityDetail__header">
                <div className={`ActivityDetail__badge ActivityDetail__badge--${type}`} />
                <div className="ActivityDetail__content">
                  <p>{this._formatTitle(props.itemKey)}</p>
                </div>
              </div>

            </div>
          )
          : <hr />
        }
        { state.show
          && (
            <div className="ActivtyDetail_list">
              <DetailRecords
                keys={keys}
                sectionType={props.sectionType}
                owner={props.owner}
                name={props.name}
              />
            </div>
          )
        }

        { props.showEllipsis
          && (
            <div
              className="ActivityCard__ellipsis ActivityCard__ellipsis-detail"
              onClick={() => { this._toggleDetailsView(); }}
            />
          )
        }
      </div>
    );
  }
}
