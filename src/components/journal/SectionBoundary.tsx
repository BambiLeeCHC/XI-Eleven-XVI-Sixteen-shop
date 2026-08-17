import { Component, type ReactNode } from "react";

/**
 * A narrow, local error boundary for one card/section of AI-generated
 * content (a reading, a narrative). If something in that one render throws
 * — malformed markdown, an unexpected shape from the model — only that
 * card falls back to a plain message instead of the whole app hitting the
 * top-level ErrorBoundary and going blank.
 */
interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}
interface State {
  hasError: boolean;
}

export class SectionBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("SectionBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-sm text-muted-foreground">
          {this.props.fallbackLabel ?? "Couldn't display this just now — try refreshing."}
        </p>
      );
    }
    return this.props.children;
  }
}
