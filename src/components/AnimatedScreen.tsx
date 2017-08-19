import React, { Component } from 'react';
import ReactNative, { Animated } from 'react-native';
import { LayoutEvent } from '../models';
import { NativeRouter, Route, Link, Switch, withRouter, MemoryRouter } from 'react-router-native';

import * as ReactRouter from 'react-router';
import * as History from 'history';

/**
 * path, match and location are what is passed down from react-router
 * progress and animating is to co-ordinate animation, passed down from AnimationContainer
 * component is the actual component to render
 * render is a function, that returns a component to render
 * 
 * component and render both stands for the component to be rendered
 * if component is present, it will be used
 * otherwise render will be used
 */
interface Props {
  path: string;
  match: ReactRouter.match<any>;
  location: History.Location;
  progress: Animated.Value;
  animating: boolean;
  component: Component;
  render: (props: { path: string; match: ReactRouter.match<any>; location: History.Location }) => React.Component;
}

interface State {
  mounted: boolean;
  transitionDirection: '' | 'in' | 'out'; // could be either in/out or empty if the screen just appears
  width: number;
  height: number;
}

export default class AnimatedScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // this route matchs straight-away, should be a default route
    if (props.match) {
      /**
       * no transition-direction here, the view would just appear
       */
      this.state = {
        mounted: true,
        transitionDirection: '', // could be either in/out or empty if the screen just appears
        width: 0,
        height: 0
      };
    } else {
      this.state = {
        mounted: false,
        transitionDirection: '', // transition doesn't matter if not mounted
        width: 0,
        height: 0
      };
    }
  }

  setSize = (event: LayoutEvent) => {
    const w = event.nativeEvent.layout.width;
    const h = event.nativeEvent.layout.height;
    this.setState({
      width: w,
      height: h
    });
  };

  componentWillReceiveProps(nextProps: Props) {
    const props = this.props;
    const { transitionDirection } = this.state;
    const animationEnded = props.animating && !nextProps.animating;

    // the following are the possibilities
    // the view is just coming in - animating
    // the view is going out - animating
    // the view has come in - animation over
    // the view has gone out - animation over

    /**
     * The animation ended state change will be triggered, only when the current animation is over.
     * The end of animation only matters for a view that is going out
     * at which point the view has to be unmounted.
     */
    if (animationEnded) {
      // simple logic, if animation ends, then transition should be empty
      this.setState({
        transitionDirection: ''
      });

      // if transition is out, then animation is ended, so unmount the view
      if (transitionDirection == 'out') {
        this.setState({
          mounted: false
        });
      }

      return;
    }

    // transition out
    if (props.match && !nextProps.match) {
      this.setState({
        transitionDirection: 'out'
      });
      return;
    }

    // transition in
    if (!props.match && nextProps.match) {
      this.setState({
        mounted: true,
        transitionDirection: 'in'
      });
      return;
    }
  }

  slideInLeft = () => {
    const { component: Component, location, progress } = this.props;
    const { transitionDirection, mounted, width, height } = this.state;

    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, 0]
    });
  };

  slideInRight = () => {
    const { component: Component, location, progress } = this.props;
    const { transitionDirection, mounted, width, height } = this.state;

    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0]
    });
  };

  slideOutLeft = () => {
    const { component: Component, location, progress } = this.props;
    const { transitionDirection, mounted, width, height } = this.state;

    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width]
    });
  };

  slideOutRight = () => {
    const { component: Component, location, progress } = this.props;
    const { transitionDirection, mounted, width, height } = this.state;

    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width]
    });
  };

  translateX = () => {
    const { location, progress } = this.props;
    const { transitionDirection } = this.state;

    // no transition
    if (!transitionDirection) return 0;

    // the component is mounted, either on screen, or animating-in or animating-out
    // if animating-in, will just appear after the animation is over
    // if animating-out, will become invisible and hence will not be rendered after the animation is over

    const direction = (location.state && location.state.direction) || 'forward';

    /**
     * based on direction and if the screen is animating in/out we have to choose the translateX value
     */
    var translateX;

    if (transitionDirection == 'in')
      if (direction == 'forward') return this.slideInRight();
      else return this.slideInLeft();

    if (transitionDirection == 'out') {
      // animating-out
      if (direction == 'forward') return this.slideOutLeft();
      else return this.slideOutRight();
    }

    console.error('Unknown transition direction ' + transitionDirection);
    return 0;
  };

  component = (): React.ClassType<any, any, any> => {
    const { component, render, path, match, location } = this.props;

    /**
     * If component present, use it.
     * 
     * Just like in react-router docs.
     * https://reacttraining.com/react-router/native/api/Route
     *
     * <Route component> takes precendence over <Route render> so don’t use both in the same <Route>.
     */
    if (component && render)
      console.error(
        'Both component and render defined. Using component. Check AnimatedRoute definition for path ' + path
      );

    if (component) return component;

    if (render)
      return () =>
        render({
          path,
          match,
          location
        });

    console.error('Neither component nor render defined. Check AnimatedRoute definition for path ' + path);
    return null;
  };

  render() {
    const { transitionDirection, mounted } = this.state;

    // component={Component} progress={progress} {...{ match, location, animating }} {...rest}

    // at this state the component is not mounted and not rendered
    if (!mounted) return null;

    const style = {
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transform: [
        {
          translateX: this.translateX()
        }
      ]
    };

    const Component = this.component();

    return (
      <Animated.View style={style} onLayout={this.setSize}>
        <Component />
      </Animated.View>
    );
  }
}
