// vendor
import React, { Component, Node } from 'react';
// assets
import './ErrorBoundary.scss';

type Props = {
  children: Node,
  type: string,
};

class ErrorBoundary extends Component<Props> {
  constructor() {
    super();
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    const text = (this.props.type !== 'containerStatusError')
      ? 'There was an error fetching data for this component. Refresh the page and try again.'
      : 'Error';

    if (this.state.hasError) {
      return (
        <div className={`ErrorBoundary ErrorBoundary--${this.props.type}`}>
          <p>{text}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
