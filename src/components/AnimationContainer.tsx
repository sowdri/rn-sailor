import React, { Component } from 'react';
import ReactNative, { Animated } from 'react-native';
import { LayoutEvent } from '../models';
import { NativeRouter, Route, Link, Switch, withRouter, MemoryRouter } from 'react-router-native';

import * as ReactRouter from 'react-router';
import * as History from 'history';

/**
 * Since this is called withRouter of react-router, 
 * match, location and history are passed from react-router withRouter HOC
 */
interface Props {
  match?: ReactRouter.match<any>;
  location?: History.Location;
  history?: History.History;
  children: (props: { progress: Animated.Value; animating: boolean }) => React.ClassType<any, any, any>;
}
interface State {
  progress: Animated.Value;
  animating: boolean;
}

class AnimationContainer extends React.Component<Props, State> {
  //
  constructor(props: Props) {
    super(props);
    this.state = {
      progress: new Animated.Value(0),
      animating: false
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // check if prev url and current url is different, otherwise no-op
    const currentProps = this.props;
    if (currentProps.location.pathname == nextProps.location.pathname) return;
    console.log('animating');
    // then trigger animation
    const { progress } = this.state;
    progress.setValue(0);

    // at the end of animation, reset progress to 0
    this.setState(
      {
        animating: true
      },
      () => {
        Animated.timing(progress, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          this.setState({
            animating: false
          });
        });
      }
    );
  }

  render() {
    const { progress, animating } = this.state;
    return this.props.children({ progress, animating });
  }
}

export default withRouter(AnimationContainer);
