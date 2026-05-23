import { useRef } from "react";
import { Animated } from "react-native";

interface StepTransition {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  transitionForward: (onMidpoint: () => void) => void;
  transitionBack: (onMidpoint: () => void) => void;
  animatedStyle: { opacity: Animated.Value; transform: { translateX: Animated.Value }[] };
}

export default function useStepTransition(): StepTransition {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  function transitionForward(onMidpoint: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      onMidpoint();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  function transitionBack(onMidpoint: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 30, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      onMidpoint();
      slideAnim.setValue(-30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  return {
    fadeAnim,
    slideAnim,
    transitionForward,
    transitionBack,
    animatedStyle: { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
  };
}
