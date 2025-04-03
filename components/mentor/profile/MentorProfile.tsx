import React, { useState } from "react";
import { View, StyleSheet, TextInput, Image, Button } from "react-native";
import { Card, Title } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

const MentorProfile = () => {
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Profil Fotoğrafı</Title>
          <Image
            source={{ uri: "https://yourimageurl.com" }}
            style={styles.profileImage}
          />

          <Title style={styles.title}>Biyografi</Title>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Kısa biyografinizi yazın..."
            style={styles.textInput}
            multiline
          />

          <Title style={styles.title}>Uzmanlık Alanları</Title>
          <Picker
            selectedValue={expertise}
            onValueChange={(itemValue) => setExpertise(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Yazılım Geliştirme" value="development" />
            <Picker.Item label="Kariyer Rehberliği" value="career" />
            <Picker.Item label="Kişisel Gelişim" value="personal" />
          </Picker>

          <Button title="Kaydet" onPress={() => {}} color="#6200EE" />
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  card: {
    marginTop: 20,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingTop: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default MentorProfile;
