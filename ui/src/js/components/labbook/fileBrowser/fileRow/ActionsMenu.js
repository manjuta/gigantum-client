// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './ActionsMenu.scss';

export default class ActionsMenu extends Component {
  /**
  *  @param {}
  *  triggers favoirte unfavorite mutation
  *  @return {}
  */
  _triggerFavoriteMutation() {
     const data = {
      key: this.props.edge.node.key,
      edge: this.props.edge,
     };

     if (this.props.edge.node.isFavorite) {
       this.props.mutations.removeFavorite(data, (response) => {
         console.log(response);
       });
     } else {
       this.props.mutations.addFavorite(data, (response) => {
         console.log(response);
       });
     }
  }

  render() {
    const favoriteCSS = classNames({
      ActionsMenu__item: true,
      'ActionsMenu__item--favorite-on': this.props.edge.node.isFavorite,
      'ActionsMenu__item--favorite-off': !this.props.edge.node.isFavorite,
    });
    return (
        <div className="ActionsMenu">
          <div
            className="ActionsMenu__item ActionsMenu__item--delete"
            name="Delete">
          </div>
          <div
            onClick={() => { this.props.renameEditMode(true); }}
            className="ActionsMenu__item ActionsMenu__item--rename"
            name="Rename">
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--duplicate"
            name="Duplicate">
          </div>
          <div
            onClick={ () => { this._triggerFavoriteMutation(); }}
            className={favoriteCSS}
            name="Favorite">
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--menu"
            name="Menu">
          </div>
        </div>
    );
  }
}
