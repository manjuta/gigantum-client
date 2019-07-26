// vendor
import React from 'react';
// assets
import './AddBundle.scss';

export default props => (
  <div className="AddBundle">
    <div className="AddBundle__container flex justify--space-between relative">
      <button
        type="button"
        className="Btn Btn--flat AddBundle__close padding--small "
        onClick={() => props.modifyCustomApp(props.index, 'remove')}
      />
      <div className="AddBundle__port flex flex--column">
        <div className="AddBundle__label">Port Number</div>
        <input
          type="text"
          value={props.formData.portNumber}
          onChange={evt => props.modifyCustomApp(props.index, 'portNumber', evt)}
          placeholder="6008"
        />
      </div>
      <div className="AddBundle__name flex flex--column">
        <div className="AddBundle__label">Application Name</div>
        <input
          type="text"
          value={props.formData.name}
          onChange={evt => props.modifyCustomApp(props.index, 'name', evt)}
          maxLength="10"
          placeholder="sample-port"
        />
      </div>
      <div className="AddBundle__description flex flex--column flex-1">
        <div className="AddBundle__label">Application Description</div>
        <input
          type="text"
          value={props.formData.description}
          onChange={evt => props.modifyCustomApp(props.index, 'description', evt)}
          placeholder="port description here"
        />
      </div>
      <div className="AddBundle__description flex flex--column flex-1">
        <div className="AddBundle__label">Command</div>
        <input
          type="text"
          value={props.formData.command}
          onChange={evt => props.modifyCustomApp(props.index, 'command', evt)}
          placeholder="i.e. python myapp.py"
        />
      </div>
    </div>
  </div>
);
