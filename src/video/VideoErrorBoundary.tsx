/**
 * VideoErrorBoundary - Error boundary specifically for video components
 * Prevents video errors from crashing the entire app
 */

import React from "react";

type Props = { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
};

type State = { 
  hasError: boolean;
  error?: Error;
};

export class VideoErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("Video boundary caught:", error, errorInfo?.componentStack);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
