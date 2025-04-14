import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDayForChat } from "../../utils/dateFormatter";

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginVertical: theme.spacing.m,
    },
    line: {
      height: 1,
      backgroundColor: theme.colors.background.secondary,
      flex: 1,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.m,
    },
    dateText: {
      color: theme.colors.text.secondary,
      fontSize: 12,
      marginHorizontal: theme.spacing.s,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <View style={styles.line} />
        <Text style={styles.dateText}>{formatDayForChat(date)}</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
};

export default React.memo(DateSeparator);
