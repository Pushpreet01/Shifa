import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  starColor?: string;
  inactiveStarColor?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 40,
  starColor = "#F4A941",
  inactiveStarColor = "#D1D1D1",
}) => {
  const starWidth = size + 10; // Width of a star including margin

  const calculateRating = (locationX: number) => {
    const position = Math.max(0, locationX);
    const rawRating = position / starWidth;
    const roundedRating = Math.round(rawRating * 2) / 2; // Round to nearest 0.5
    return Math.max(0.5, Math.min(5, roundedRating)); // Clamp between 0.5 and 5
  };

  // --- Gestures ---
  const tapGesture = Gesture.Tap().onStart((event) => {
    // Handles single taps
    onRatingChange(calculateRating(event.x));
  });

  const panGesture = Gesture.Pan().onUpdate((event) => {
    // Handles sliding
    onRatingChange(calculateRating(event.x));
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let iconName: "star" | "star-half" | "star-outline" = "star-outline";
      if (rating >= i) {
        iconName = "star";
      } else if (rating >= i - 0.5) {
        iconName = "star-half";
      }
      stars.push(
        <Ionicons
          key={i}
          name={iconName}
          size={size}
          color={iconName === "star-outline" ? inactiveStarColor : starColor}
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[styles.container, { height: size }]}>{renderStars()}</View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
  },
  star: {
    marginHorizontal: 5,
  },
});

export default StarRating;
