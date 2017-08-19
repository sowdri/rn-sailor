import React, { Component } from 'react';
import ReactNative, { Animated } from 'react-native';
import { LayoutEvent } from '../models';
import { NativeRouter, Route, Link, Switch, withRouter, MemoryRouter } from 'react-router-native';

import * as ReactRouter from 'react-router';
import * as History from 'history';

import AnimatedScreen from './AnimatedScreen';

interface Props {
  path: string;
  progress: Animated.Value;
  animating: boolean;
  component?: Component;
  render?: (props: { path: string; match: ReactRouter.match<any>; location: History.Location }) => React.Component;
}

const AnimatedRoute = ({ path, progress, animating, component, render }: Props) =>
  <Route path={path}>
    {({ match, location }) => {
      return <AnimatedScreen {...{ path, match, location, progress, animating, component, render }} />;
    }}
  </Route>;

export default AnimatedRoute;
