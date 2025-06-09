import React, { useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const calculateRating = (locationX: number) => {
    const starWidth = size + 10; // Width of star plus padding
    const position = locationX / starWidth;
    const decimal = position % 1;
    let newRating: number;

    if (decimal < 0.25) {
      newRating = Math.floor(position);
    } else if (decimal >= 0.25 && decimal < 0.75) {
      newRating = Math.floor(position) + 0.5;
    } else {
      newRating = Math.ceil(position);
    }

    return Math.max(0.5, Math.min(5, newRating));
  };

  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event: GestureResponderEvent) => {
        const { locationX } = event.nativeEvent;
        const newRating = calculateRating(locationX);
        if (newRating !== rating) {
          onRatingChange(newRating);
        }
      },
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX } = event.nativeEvent;
        const newRating = calculateRating(locationX);
        if (newRating !== rating) {
          onRatingChange(newRating);
        }
      },
    })
  );

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={size}
            color={starColor}
            style={styles.star}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={size}
            color={starColor}
            style={styles.star}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={size}
            color={inactiveStarColor}
            style={styles.star}
          />
        );
      }
    }
    return stars;
  };

  return (
    <View
      style={[styles.container, { height: size }]}
      {...panResponder.panHandlers}
    >
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  star: {
    marginHorizontal: 5,
  },
});

export default StarRating;
