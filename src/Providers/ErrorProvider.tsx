import React, { Component, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: any) {
		console.error('ErrorBoundary caught an error', error, info);
	}

	render() {
		if (this.state.hasError) {
			return <h1>Something went wrong.</h1>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
