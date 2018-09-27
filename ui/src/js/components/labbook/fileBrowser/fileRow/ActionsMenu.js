// vendor
import React, { Component } from 'react';
// assets
import './ActionsMenu.scss';

export default class ActionsMenu extends Component {
  render() {
    return (
        <div className="ActionsMenu">
          <div
            className="ActionsMenu__item ActionsMenu__item--delete"
            name="Delete"
          >
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--rename"
            name="Rename"
          >
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--duplicate"
            name="Duplicate"
          >
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--favorite"
            name="Favorite"
          >
          </div>
          <div
            className="ActionsMenu__item ActionsMenu__item--actions"
            name="Actions"
          >
          </div>
        </div>
    );
  }
}
