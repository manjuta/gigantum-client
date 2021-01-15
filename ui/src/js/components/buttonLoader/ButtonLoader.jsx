// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// assets
import './ButtonLoader.scss';

type Props = {
  buttonState: string,
  buttonText: string,
  buttonDisabled: boolean,
  className: string,
  clicked: Function,
}

const ButtonLoader = (props: Props) => {
  const {
    buttonState,
    buttonText,
    buttonDisabled,
    className,
    clicked,
  } = props;
  const buttonDisplayText = buttonState !== 'finished' ? buttonText : '✓';
  // declare css here
  const buttonLoaderCSS = classNames({
    'Btn ButtonLoader': true,
    [`ButtonLoader--${buttonState}`]: buttonState !== '',
    [className]: (className !== null),
  });
  const buttonLoaderIconCSS = classNames({
    ButtonLoader__icon: true,
    hidden: buttonState !== 'loading',
  });

  return (
    <button
      type="submit"
      disabled={(buttonState !== '') || buttonDisabled}
      className={buttonLoaderCSS}
      onClick={evt => clicked(evt, props)}
    >
      <div className={buttonLoaderIconCSS} />
      {buttonDisplayText}
    </button>
  );
};

export default ButtonLoader;
