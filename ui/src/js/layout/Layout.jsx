// @flow
// vendor
import React, { Node } from 'react';
// component
import Footer from 'Components/footer/Footer';
import Prompt from 'Components/prompt/Prompt';
import Helper from 'Components/helper/Helper';
import Header from './header/Header';
import Sidebar from './sidebar/Sidebar';
// assets
import './Layout.scss';

type Props = {
  auth: Object,
  children: Node,
  showDiskLow: boolean,
}

const Layout = (props: Props) => {
  const { auth, children } = props;
  return (
    <div className="Layout">
      <Header {...props} />

      <Sidebar {...props} />

      <main className="Layout__main">
        {children}
      </main>

      <Footer />

      <Helper auth={auth} />

      <Prompt />
    </div>
  );
};


export default Layout;
