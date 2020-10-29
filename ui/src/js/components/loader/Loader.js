// vendor
import React from 'react';
import classNames from 'classnames';
// assets
import './Loader.scss';

type Props = {
  nested: boolean,
}

const Loader = (props: Props) => {
  const loaderCSS = classNames({
    Loader: !props.nested,
    'Loader--nested': props.nested,
  });

  return (
    <div className={loaderCSS} />
  );
};


export default Loader;
