import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  Props,
  State
> {
  state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
    }
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo,
  ) {
    console.error(
      'Application error:',
      error,
      info,
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#080b0f] px-6 text-white">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
              Application error
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] uppercase">
              Something
              <span className="block text-white/25">
                went wrong.
              </span>
            </h1>

            <p className="mt-6 text-sm leading-7 text-white/45">
              The application encountered an unexpected error.
              Reload the page to try again.
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 border border-[#6CABDD]/30 px-5 py-3 text-xs font-bold tracking-[0.15em] text-[#8FC9ED] uppercase"
            >
              Reload
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}