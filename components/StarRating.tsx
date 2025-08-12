import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, PanResponder, LayoutRectangle } from "react-native";
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
  const containerRef = useRef<View>(null);
  const [containerLayout, setContainerLayout] = useState<LayoutRectangle | null>(null);
  const totalStars = 5;
  const starSpacing = size + 10;

  const calculateRating = (x: number): number => {
    if (!containerLayout) return rating;

    // Calculate the total width available for stars
    const totalWidth = starSpacing * totalStars;
    
    // Normalize the x position relative to the container
    const containerStart = (containerLayout.width - totalWidth) / 2;
    const adjustedX = Math.max(0, x - containerStart);
    
    // Calculate the exact position in star units (0 to 5)
    const exactPosition = adjustedX / starSpacing;
    
    // Get the current star index (0-4) and the precise position within that star
    const currentStarIndex = Math.floor(exactPosition);
    const positionInStar = exactPosition - currentStarIndex;
    
    // Calculate the rating with smooth transitions
    let newRating = currentStarIndex + 1; // Base rating (1-5)

    // Progressive filling of stars
    if (positionInStar > 0.1) { // Ignore very small movements
      if (positionInStar < 0.6) { // First 60% of the star width
        newRating -= 0.5; // Show half star
      }
      // After 60%, it will show full star (already included in base rating)
    } else if (positionInStar <= 0.1 && currentStarIndex > 0) {
      // When very close to the start of a star, ensure we're showing the previous star's state
      newRating = currentStarIndex;
    }

    // Ensure the rating stays within bounds and handle edge cases
    return Math.max(0.5, Math.min(5, newRating));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      if (containerLayout) {
        const newRating = calculateRating(gestureState.x0 - containerLayout.x);
        if (newRating !== rating) {
          onRatingChange(newRating);
        }
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (containerLayout) {
        const newRating = calculateRating(gestureState.moveX - containerLayout.x);
        if (newRating !== rating) {
          onRatingChange(newRating);
        }
      }
    },
  });

  const handleStarPress = (selectedRating: number) => {
    if (Math.ceil(rating) === selectedRating) {
      if (rating === selectedRating) {
        onRatingChange(selectedRating - 0.5);
      } else {
        onRatingChange(selectedRating);
      }
    } else {
      onRatingChange(selectedRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      let iconName: "star" | "star-half" | "star-outline" = "star-outline";
      if (rating >= i) {
        iconName = "star";
      } else if (rating >= i - 0.5) {
        iconName = "star-half";
      }
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={iconName}
            size={size}
            color={iconName === "star-outline" ? inactiveStarColor : starColor}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View 
      ref={containerRef}
      style={[styles.container, { height: size + 20 }]}
      {...panResponder.panHandlers}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setContainerLayout({ x: pageX, y: pageY, width, height });
        });
      }}
    >
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  starButton: {
    padding: 5,
  },
});

export default StarRating;
