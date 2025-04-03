import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const MentorReviews = () => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Yorumlar ve Puanlar</Title>
        <Paragraph>Henüz yorum yapılmamış.</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MentorReviews;
