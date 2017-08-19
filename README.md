# React Native - Sailor ️⛵

Navigation for react-native based on react-router(v4)

## Design

- For each route change an animation will be triggered by the `AnimationContainer`
- The animation will be orchestrated by a variable called `progress`, that will transition from 0-1.
- Each `AnimatedScreen` is free to do their own animations/transitions by interpolating on the animated variable progress.
- Each `AnimatedScreen` wraps around a component/screen which will be either mounted or unmounted.
- A boolean variable `mounted` determines if the wrapped component is mounted or not.

## Players

This library is a set of components that works together to create the transition animations. This section explains the functionality of each of the components. 

```jsx
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
```

### AnimationContainer

AnimationContainer orchestrates the transition animation across multiple components. It does the orchestration by using 2 variables `animating` and `progress`. 

- Variable `animating:boolean` is true if an transition animation is in progress
- Variable `progress:Animated.Value` varies from `0` to `1` denoting the progress of the animation

The animation container takes a `duration` (TBI) for ex: `300ms`. AnimationContainer listens to route changes and if a route change occurs then the following events happen:

- `animating` is set to `true`
- `progress` will change over from `0` to `1` in `300ms`
- after `300ms` `animating` will be set to `false` (the transition is over)

### AnimatedRoute

AnimatedRoute is a simple wrapper over react-router `Route` component. In fact the total implementation is just the following lines. 

> `rest` params is not clear at the moment, that has to be refined.

```jsx
const AnimatedRoute = ({ path, ...rest }) =>
  <Route path={path}>
    {({ match, location }) => {
      return <AnimatedScreen {...rest} {...{ path, match, location }} />;
    }}
  </Route>;
```

### AnimatedScreen


`AnimatedScreen` is a simple component with 2 state variables

mounted: boolean
transition: '' | 'in' | 'out'

mounted - determines if the wrapped component is mounted or not. If unmounted, it will be not be rendered.
transition - holds the current transition
        - if empty, then no transition is in progress

