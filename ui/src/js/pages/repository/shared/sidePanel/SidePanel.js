// vendor
import React, { Component, Node } from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
// assets
import './SidePanel.scss';


type Props = {
  children: Node,
  diskLow: boolean,
  isDeprecated: boolean,
  isSticky: boolean,
  toggleSidePanel: Function,
};

class SidePanel extends Component<Props> {
  state = {
    isPanelOpen: false,
  }

  /**
    @param {} -
    updates panelState
    @return {}
  */
  _togglePanel = () => {
    this.setState((state) => {
      const isPanelOpen = !state.isPanelOpen;
      return { isPanelOpen };
    });
  }

  render() {
    const {
      children,
      diskLow,
      isDeprecated,
      isSticky,
      toggleSidePanel,
    } = this.props;

    const isPushedDownTwice = diskLow && isDeprecated;
    const isPushedDownOnce = (diskLow || isDeprecated)
      && !isPushedDownTwice;

    // declare css here
    const sidePanelCSS = classNames({
      SidePanel: true,
      'SidePanel--sticky': isSticky && !isDeprecated,
      'SidePanel--deprecated': isPushedDownOnce && !isSticky,
      'SidePanel--deprecated--disk-low': isPushedDownTwice && !isSticky,
      'SidePanel--deprecated--disk-low--sticky': isPushedDownTwice && isSticky,
      'SidePanel--deprecated-sticky': isPushedDownOnce && isSticky,
    });

    return (
      ReactDom.createPortal(
        <section className={sidePanelCSS}>
          <div className="SidePanel__header">
            <div
              role="presentation"
              onClick={() => toggleSidePanel(false)}
              className="SidePanel__btn SidePanel__btn--close"
            />
          </div>
          <div className="SidePanel__body">
            { children }
          </div>
        </section>, document.getElementById('side_panel'),
      )
    );
  }
}

export default SidePanel;
