import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

/** App-wide crash guard: a render error shows a recoverable message instead of
 * a blank white screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pv-loadstate" role="alert">
          <p className="pv-heading">Something went wrong.</p>
          <button className="pv-retry" onClick={() => window.location.assign('/')}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
