// vendor
import React, { Component } from 'react';
// assets
import './FileCard.scss';

export default class Overview extends Component {
  _truncate(string, cutoff) {
    if (string.length > cutoff) {
      const stringCutoff = string.substring(0, cutoff);
      return `${stringCutoff}...`;
    }
    return string;
  }

  render() {
    const { props } = this;
    const paths = props.edge.node.key.split('/');
    const name = paths[paths.length - 1];
    const truncatedName = this._truncate(name, 32);
    paths.pop();
    const path = `${props.sectionType}/${paths.join('/')}`;
    return (
      <div className="FileCard Card Card--auto Card--no-hover column-3-span-4--shrink">
        <div className="FileCard__favorite" />
        <h6 title={name} className="FileCard__name">{truncatedName}</h6>
        <p className="FileCard__key">{path}</p>
        <p className="FileCard__description">{props.edge.node.description}</p>
      </div>
    );
  }
}
