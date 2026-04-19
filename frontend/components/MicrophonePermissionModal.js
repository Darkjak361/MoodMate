import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/theme';

export default function MicrophonePermissionModal({ visible, onClose }) {
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const instructions = Platform.select({
        web: [
            { icon: 'lock-closed-outline', text: '1. Click the Lock icon in the address bar (at the top left of the URL).' },
            { icon: 'options-outline', text: '2. Find "Microphone" and toggle the switch to ON (Allow).' },
            { icon: 'refresh-outline', text: '3. Refresh the page to apply the changes 100%!' },
        ],
        default: [
            { icon: 'settings-outline', text: '1. Open your phone Settings app.' },
            { icon: 'apps-outline', text: '2. Scroll down to find the "MoodMate" app.' },
            { icon: 'mic-outline', text: '3. Toggle the Microphone switch to ON (Allow).' },
        ]
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                    <View style={styles.header}>
                        <View style={[styles.iconBadge, { backgroundColor: activeColors.error + '20', borderColor: activeColors.border }]}>
                            <Ionicons name="mic-off-outline" size={28} color={activeColors.error} />
                        </View>
                        <Text style={[styles.modalTitle, { color: activeColors.text }]}>Microphone Required</Text>
                        <Text style={[styles.modalSubtitle, { color: activeColors.secondary }]}>
                            To speak freely with MoodMate, we need your permission. 100%!!!
                        </Text>
                    </View>

                    <ScrollView style={styles.instructionList}>
                        {instructions.map((item, index) => (
                            <View key={index} style={styles.instructionItem}>
                                <Ionicons name={item.icon} size={20} color={activeColors.tint} style={styles.stepIcon} />
                                <Text style={[styles.instructionText, { color: activeColors.text }]}>{item.text}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: activeColors.tint, borderColor: activeColors.border }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.closeButtonText, { color: activeColors.background }]}>I Understand</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    modalView: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1.5,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1.5,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    instructionList: {
        width: '100%',
        marginBottom: 24,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingRight: 20,
    },
    stepIcon: {
        marginRight: 12,
    },
    instructionText: {
        fontSize: 14,
        lineHeight: 22,
        flexShrink: 1,
    },
    closeButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        elevation: 5,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
