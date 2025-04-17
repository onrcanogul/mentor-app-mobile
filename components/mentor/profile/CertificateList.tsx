import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { Certificate } from "../../../domain/certificate";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

interface CertificateListProps {
  certificates: Certificate[];
  isOwn: boolean;
  onEdit?: () => void;
}

const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  isOwn,
  onEdit,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const CardBackground = Platform.OS === "ios" ? BlurView : View;
  const cardProps =
    Platform.OS === "ios"
      ? { intensity: 20, tint: "dark" as BlurTint }
      : { style: { backgroundColor: "rgba(255, 255, 255, 0.05)" } };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconButton
            icon="certificate"
            size={24}
            iconColor={theme.colors.primary.main}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t("certificates")}
          </Text>
        </View>
        {isOwn && (
          <IconButton
            icon="pencil"
            size={20}
            iconColor={theme.colors.text.secondary}
            onPress={onEdit}
          />
        )}
      </View>

      <View style={styles.certificatesContainer}>
        {certificates.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            No certificates added yet.
          </Text>
        ) : (
          <View style={styles.certificatesList}>
            {certificates.map((certificate, index) => (
              <Animated.View
                key={certificate.id}
                entering={FadeInDown.delay(index * 100)}
                style={styles.certificateItem}
              >
                <CardBackground {...cardProps} style={styles.certificateCard}>
                  <View style={styles.certificateHeader}>
                    <View style={styles.certificateInfo}>
                      <Text
                        style={[
                          styles.certificateName,
                          { color: theme.colors.text.primary },
                        ]}
                      >
                        {certificate.name}
                      </Text>
                      <Text
                        style={[
                          styles.issuer,
                          { color: theme.colors.primary.main },
                        ]}
                      >
                        Issued by {certificate.from}
                      </Text>
                    </View>
                    {certificate.icon && (
                      <IconButton
                        icon={certificate.icon}
                        size={24}
                        iconColor={theme.colors.primary.main}
                      />
                    )}
                  </View>
                  {certificate.description && (
                    <Text
                      style={[
                        styles.description,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {certificate.description}
                    </Text>
                  )}
                  {certificate.skills && certificate.skills.length > 0 && (
                    <View style={styles.skillsContainer}>
                      <Text
                        style={[
                          styles.skillsTitle,
                          { color: theme.colors.text.accent },
                        ]}
                      >
                        Skills
                      </Text>
                      <View style={styles.skillsList}>
                        {certificate.skills.map((skill) => (
                          <View
                            key={skill.id}
                            style={[
                              styles.skillBadge,
                              {
                                backgroundColor: `${theme.colors.primary.main}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.skillText,
                                { color: theme.colors.primary.main },
                              ]}
                            >
                              {skill.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </CardBackground>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  certificatesContainer: {
    minHeight: 50,
  },
  certificatesList: {
    gap: 12,
  },
  certificateItem: {
    width: "100%",
  },
  certificateCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  certificateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  certificateInfo: {
    flex: 1,
    marginRight: 12,
  },
  certificateName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  issuer: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default CertificateList;
