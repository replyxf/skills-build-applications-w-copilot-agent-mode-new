import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled application error', { error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container py-5" role="alert">
          <h1>OctoFit Tracker could not load</h1>
          <p>Refresh the page to try again.</p>
          <button className="btn btn-dark" onClick={() => window.location.reload()} type="button">
            Refresh
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary