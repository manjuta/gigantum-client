// vendor
import React from 'react';
import classNames from 'classnames';
// components
import DiskHeader from './disk/DiskHeader';
// css
import './Header.scss';

type Props = {
  showDiskLow: boolean,
};

const Header = (props: Props) => {
  const { showDiskLow } = props;
  const headerCSS = classNames({
    HeaderBar: true,
    'HeaderBar--disk-low': showDiskLow,
  });

  return (
    <header>
      <div className={headerCSS} />
      <DiskHeader />
    </header>
  );
};

export default Header;
