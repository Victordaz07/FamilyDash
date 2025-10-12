/**
 * 🎯 GOAL INSPIRATION SCREEN — FamilyDash+
 * Add visual inspiration and motivational content for family goals
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AddInspirationScreen() {
    const navigation = useNavigation();
    const [inspirationType, setInspirationType] = useState<'image' | 'quote' | 'memory'>('image');
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUri, setImageUri] = useState("");
    const [loading, setLoading] = useState(false);

    const inspirationTypes = [
        { 
            id: 'image', 
            name: 'Imagen', 
            icon: 'image', 
            color: '#FF6B6B',
            description: 'Imagen de tu meta o objetivo'
        },
        { 
            id: 'quote', 
            name: 'Cita', 
            icon: 'quote', 
            color: '#4ECDC4',
            description: 'Frase motivacional para alcanzar metas'
        },
        { 
            id: 'memory', 
            name: 'Logro', 
            icon: 'trophy', 
            color: '#45B7D1',
            description: 'Momento de éxito que quieres recordar'
        },
    ];

    const handleAddInspiration = async () => {
        if (!title.trim()) {
            Alert.alert("Falta título", "Por favor agrega un título para tu inspiración");
            return;
        }

        if (!content.trim()) {
            Alert.alert("Falta contenido", "Por favor agrega el contenido de tu inspiración");
            return;
        }

        setLoading(true);
        try {
            // Aquí se guardaría la inspiración en Firebase
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular guardado
            
            Alert.alert("¡Inspiración agregada!", "Tu inspiración se ha agregado al Vision Board ✨", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "No se pudo agregar la inspiración. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = () => {
        Alert.alert(
            "Seleccionar imagen",
            "¿Cómo quieres agregar tu imagen?",
            [
                { text: "Cámara", onPress: () => console.log("Abrir cámara") },
                { text: "Galería", onPress: () => console.log("Abrir galería") },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <LinearGradient colors={["#FF6B6B", "#4ECDC4"]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Goal Inspiration</Text>
                    <Text style={styles.headerSubtitle}>
                        Motiva tu familia hacia sus metas 🎯
                    </Text>
                </View>
            </LinearGradient>

            {/* FORM */}
            <View style={styles.form}>
                {/* INSPIRATION TYPE */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tipo de Motivación</Text>
                    <View style={styles.typeGrid}>
                        {inspirationTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeCard,
                                    { borderColor: type.color },
                                    inspirationType === type.id && styles.typeCardSelected
                                ]}
                                onPress={() => setInspirationType(type.id as any)}
                            >
                                <View style={[styles.typeIcon, { backgroundColor: type.color }]}>
                                    <Ionicons name={type.icon as any} size={20} color="white" />
                                </View>
                                <Text style={styles.typeName}>{type.name}</Text>
                                <Text style={styles.typeDescription}>{type.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* TITLE INPUT */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Título</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="¿Qué meta representa esta motivación?"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* CONTENT BASED ON TYPE */}
                {inspirationType === 'image' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Imagen</Text>
                        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={40} color="#ccc" />
                                    <Text style={styles.imagePlaceholderText}>Toca para seleccionar imagen</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {(inspirationType === 'quote' || inspirationType === 'memory') && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            {inspirationType === 'quote' ? 'Cita Motivacional' : 'Descripción del Logro'}
                        </Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder={
                                inspirationType === 'quote' 
                                    ? '"La familia que trabaja junta, logra junta"'
                                    : "Describe este logro o momento especial y cómo te motiva a alcanzar tus metas..."
                            }
                            placeholderTextColor="#999"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}

                {/* ADD BUTTON */}
                <TouchableOpacity 
                    style={[styles.addButton, loading && styles.addButtonDisabled]} 
                    onPress={handleAddInspiration}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ["#ccc", "#999"] : ["#FF6B6B", "#4ECDC4"]}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {loading ? (
                            <>
                                <Ionicons name="hourglass" size={20} color="white" />
                                <Text style={styles.addButtonText}>Agregando...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="add-circle" size={20} color="white" />
                                <Text style={styles.addButtonText}>Agregar Motivación</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9FF" },
    header: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        marginBottom: 10,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: { fontSize: 24, color: "#fff", fontWeight: "800" },
    headerSubtitle: { fontSize: 14, color: "#EEE", marginTop: 4, textAlign: 'center' },

    form: { padding: 20 },
    inputGroup: { marginBottom: 24 },
    inputLabel: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },

    // Type Selection
    typeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    typeCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        width: "30%",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    typeCardSelected: {
        borderColor: "#6C63FF",
        backgroundColor: "#F8F9FF",
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    typeName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    typeDescription: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
        lineHeight: 14,
    },

    // Input Fields
    textInput: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },

    // Image Selection
    imageButton: {
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        overflow: "hidden",
    },
    imagePlaceholder: {
        height: 150,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9F9FF",
    },
    imagePlaceholderText: {
        color: "#666",
        marginTop: 8,
        fontSize: 14,
    },
    selectedImage: {
        width: "100%",
        height: 150,
        resizeMode: "cover",
    },

    // Add Button
    addButton: {
        marginTop: 20,
        borderRadius: 25,
        overflow: "hidden",
        elevation: 4,
    },
    addButtonDisabled: {
        opacity: 0.6,
        elevation: 2,
    },
    addButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    addButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 16 },
});
