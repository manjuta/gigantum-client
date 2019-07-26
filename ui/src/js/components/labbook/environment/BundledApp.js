// vendor
import React from 'react';
// assets
import './BundledApp.scss';

export default props => (
  <div className="BundledApp">
    <div className="BundledApp__container flex justify--right relative">
      <div className="BundledApp__command align-self--center">
        <span>Expose </span>
        {' '}
        {props.data.port}
      </div>
      <div className="BundledApp__sidePanel">
        <button
          type="button"
          className="Btn Btn--flat BundledApp__close padding--small "
          onClick={() => props.removeBundledApp(props.data.appName)}
        />
      </div>
    </div>
  </div>
);
