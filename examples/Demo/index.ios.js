/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import { StyleSheet, Text, View, AppRegistry, Animated, Dimensions } from 'react-native';
import _ from 'lodash';

var { height, width } = Dimensions.get('window');

import { NativeRouter, Route, Link, Switch, withRouter, MemoryRouter } from 'react-router-native';
import NavigationBar from 'react-native-navbar';
/**
 * Design
 *
 * For each route change an animation will be triggered by the AnimationContainer
 * The animation will be orchestrated by a variable called progress, that will transition from 0-1.
 *
 * Each AnimatedScreen is free to do their own animations/transitions by interpolating on the animated variable progress.
 * Each AnimatedScreen wraps around a component/screen which will be either mounted or unmounted.
 * A boolean variable 'mounted' determines if the wrapped component is mounted or not.
 *
 * AnimatedScreen is a simple component with 2 state variables
 * 
 * mounted: boolean
 * transition: '' | 'in' | 'out'
 *
 * mounted - determines if the wrapped component is mounted or not. If unmounted, it will be not be rendered.
 * transition - holds the current transition
 *            - if empty, then no transition is in progress
 * 
 * 
 */
class AnimatedScreen extends React.Component {
  constructor(props) {
    super(props);

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

  setSize = event => {
    const w = event.nativeEvent.layout.width;
    const h = event.nativeEvent.layout.height;
    console.log(w, h);
    this.setState({
      width: w,
      height: h
    });
  };

  // static propTypes = {
  //   Component: PropTypes.node,
  //   progress: PropTypes.object,
  //   animating: PropTypes.bool,
  //   match
  //   location

  // }

  componentWillReceiveProps(nextProps) {
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

  component = () => {
    const { component, render, path, match, location } = this.props;
    /**
     * If component present, use it.
     * 
     * Just like in react-router docs.
     * https://reacttraining.com/react-router/native/api/Route
     *
     * <Route component> takes precendence over <Route render> so don’t use both in the same <Route>.
     */
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

const AnimatedRoute = ({ path, ...rest }) =>
  <Route path={path}>
    {({ match, location }) => {
      return <AnimatedScreen {...rest} {...{ path, match, location }} />;
    }}
  </Route>;

class Welcome extends React.Component {
  componentDidMount() {
    console.log('mount');
  }

  componentWillUnmount() {
    console.log('unmount');
  }
  render() {
    return (
      <View style={[styles.screen, { backgroundColor: 'yellow' }]}>
        <Text>Welcome</Text>
      </View>
    );
  }
}

const Left = () => <Text>Left</Text>;

const Right = () => <Text>Right</Text>;

const Home = props =>
  <View style={[styles.screen, { backgroundColor: 'orange' }]}>
    <Text>
      {props.name}
    </Text>
  </View>;

const About = () =>
  <View style={[styles.screen, { backgroundColor: 'grey' }]}>
    <Text>About</Text>
  </View>;

const Topic = ({ match }) =>
  <View style={[styles.screen, { backgroundColor: 'white' }]}>
    <Text style={styles.topic}>
      {match.params.topicId}
    </Text>
  </View>;

const Topics = ({ match }) =>
  <View>
    <Text style={styles.header}>Topics</Text>
    <View>
      <Link to={`${match.url}/rendering`} style={styles.subNavItem} underlayColor="#f0f4f7">
        <Text>Rendering with React</Text>
      </Link>
      <Link to={`${match.url}/components`} style={styles.subNavItem} underlayColor="#f0f4f7">
        <Text>Components</Text>
      </Link>
      <Link to={`${match.url}/props-v-state`} style={styles.subNavItem} underlayColor="#f0f4f7">
        <Text>Props v. State</Text>
      </Link>
    </View>
    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route exact path={match.url} render={() => <Text style={styles.topic}>Please select a topic.</Text>} />
  </View>;

class NavBar extends React.Component {
  render() {
    return (
      <View style={styles.nav}>
        <Link to={{ pathname: '/', state: { title: 'Home' } }} underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Home</Text>
        </Link>
        <Link to={{ pathname: '/about', state: { title: 'About' } }} underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>About</Text>
        </Link>
        <Link to={{ pathname: '/welcome', state: { title: 'Welcome' } }} underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Welcome</Text>
        </Link>
        <Link
          to={{
            pathname: '/welcome',
            state: { direction: 'back', title: 'Welcome Back' }
          }}
          underlayColor="#f0f4f7"
          style={styles.navItem}>
          <Text>Welcome</Text>
        </Link>
        <Link to="/topics" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Topics</Text>
        </Link>
      </View>
    );
  }
}

function get(func, fallbackValue) {
  try {
    return func();
  } catch (e) {
    return fallbackValue;
  }
}

class Nav extends React.Component {
  render() {
    const { location } = this.props;
    const title = get(() => location.state.title);

    return (
      <View style={{ backgroundColor: 'grey', height: 60 }}>
        <Text>
          {title}
        </Text>
      </View>
    );
  }
}

class _AnimationContainer extends React.Component {
  // static propTypes = {
  //   data: PropTypes.object,
  //   match: PropTypes.object,
  //   location: PropTypes.object,
  //   history: PropTypes.object
  // }
  constructor(props) {
    super(props);
    this.state = {
      progress: new Animated.Value(0),
      animating: false
    };
  }

  componentWillReceiveProps(nextProps) {
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

const AnimationContainer = withRouter(_AnimationContainer);

const App = () =>
  <NativeRouter initialEntries={[{ pathname: '/', state: { title: 'Hello' } }]} initialIndex={0}>
    <AnimationContainer>
      {({ progress, animating }) => {
        return (
          <View style={styles.container}>
            <Route render={props => <NavigationBar title={{ title: get(() => props.location.state.title) }} />} />
            <Route render={props => <NavBar {...props} {...{ progress, animating }} />} />
            <View style={{ width: 250, height: 100, overflow: 'hidden' }}>
              <AnimatedRoute path="/" {...{ progress, animating }} render={({ location }) => <Home name={'Home'} />} />
              <AnimatedRoute path="/about" component={About} {...{ progress, animating }} />
              <AnimatedRoute path="/welcome" component={Welcome} {...{ progress, animating }} />
              <AnimatedRoute path="/topics" component={Topics} {...{ progress, animating }} />
            </View>
          </View>
        );
      }}
    </AnimationContainer>
  </NativeRouter>;

// const App = () => (
//   <NativeRouter>
//     <AnimationContainer>
//       <NavBar />
//       <AnimatedRoute path="/home" component={Home} {...{ progress, animating, width, height }} />
//       <AnimatedRoute path="/about" component={About} {...{ progress, animating, width, height }} />
//       <AnimatedRoute path="/welcome" component={Welcome} {...{ progress, animating, width, height }} />
//       <AnimatedRoute path="/topics" component={Topics} {...{ progress, animating, width, height }} />
//     </AnimationContainer>
//     <Route component={AnimationContainer} />
//   </NativeRouter>
// )

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    fontSize: 20
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10
  },
  subNavItem: {
    padding: 5
  },
  topic: {
    textAlign: 'center',
    fontSize: 15
  },
  screen: {
    backgroundColor: '#ccc',
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }
});

AppRegistry.registerComponent('Demo', () => App);
