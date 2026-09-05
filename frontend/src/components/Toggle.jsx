import React from 'react'
import './Toggle.scss';
function Toggle(props) {
  return (
      <div className="toggle-switch">
          <input
              type="checkbox"
              className="toggle-switch-checkbox"
              name={props.Name}
              id={props.Name}
          />
          <label className="toggle-switch-label" htmlFor={props.Name}>
              <span className="toggle-switch-inner" data-yes="Yes" data-no="No" />
              <span className="toggle-switch-switch" />
          </label>
      </div>
  )
}

export default Toggle;
