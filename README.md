# React Native - Sailor ️⛵

Navigation for react-native based on react-router(v4)

## Design

For each route change an animation will be triggered by the `AnimationContainer`
The animation will be orchestrated by a variable called `progress`, that will transition from 0-1.

Each `AnimatedScreen` is free to do their own animations/transitions by interpolating on the animated variable progress.
Each `AnimatedScreen` wraps around a component/screen which will be either mounted or unmounted.
A boolean variable `mounted` determines if the wrapped component is mounted or not.

`AnimatedScreen` is a simple component with 2 state variables

mounted: boolean
transition: '' | 'in' | 'out'

mounted - determines if the wrapped component is mounted or not. If unmounted, it will be not be rendered.
transition - holds the current transition
        - if empty, then no transition is in progress

