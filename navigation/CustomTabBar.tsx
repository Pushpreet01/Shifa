import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const height = 65;
const curveHeight = 50;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const getIconName = (route: string, isFocused: boolean) => {
    if (route === "Home") return isFocused ? "home" : "home-outline";
    if (route === "Settings")
      return isFocused ? "settings" : "settings-outline";
    if (route === "Resources") return isFocused ? "book" : "book-outline";
    if (route === "Compose") return isFocused ? "mail" : "mail-outline";
    return "ellipse-outline";
  };

  const getDynamicLabel = () => {
    const activeRoute = state.routes[state.index].name;
    switch (activeRoute) {
      case "Home":
        return "Home";
      case "Settings":
        return "Settings";
      case "Resources":
        return "Resources";
      case "Compose":
        return "Compose";
      default:
        return "Shifa";
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Curve */}
      <View style={styles.svgContainer}>
        <Svg
          width={width}
          height={height + curveHeight}
          viewBox={`0 0 ${width} ${height + curveHeight}`}
        >
          <Path
            fill="#FFFFFF"
            stroke="#C2BFB7"
            strokeWidth={1.4}
            d={`M0,${curveHeight}
                C${width * 0.25},0 ${width * 0.75},0 ${width},${curveHeight}
                L${width},${height + curveHeight}
                L0,${height + curveHeight}
                Z`}
          />
        </Svg>
      </View>

      {/* Decorative Arc */}
      <View style={styles.svgContainer}>
        <Svg
          width={width}
          height={curveHeight}
          style={{ position: "absolute", bottom: height - 50 }}
        >
          <Path
            fill="#F8F5E9"
            stroke="#C2BFB7"
            strokeWidth={1.4}
            d={`M0,${curveHeight}
                C${width * 0.25},0 ${width * 0.75},0 ${width},${curveHeight}`}
          />
        </Svg>
      </View>

      {/* Dynamic Label */}
      <View style={styles.shifaLabelContainer}>
        <Text style={styles.shifaLabel}>{getDynamicLabel()}</Text>
      </View>

      {/* Icons */}
      <View style={styles.iconContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabButton, index === 1 && styles.middleTab]}
            >
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={28}
                color={isFocused ? "black" : "gray"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width,
    height: height + 30,
  },
  svgContainer: {
    position: "absolute",
    bottom: 0,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height,
    paddingBottom: 10,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    width: width / 3,
  },
  middleTab: {
    transform: [{ translateY: -15 }],
  },
  shifaLabelContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shifaLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
});

export default CustomTabBar;
// This code defines a custom tab bar component for a React Native application using React Navigation.
// It includes a curved background, dynamic label, and icons for navigation.
