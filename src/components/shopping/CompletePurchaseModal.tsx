import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { saveShoppingHistory } from "@/services/shoppingHistory";

type Props = {
  visible: boolean;
  onClose: () => void;
  list: ShoppingList;
  items: ShoppingItem[];
  estimatedTotal: number;
  storeName?: string;
  onComplete: () => void;
  familyId: string;
  userId: string;
};

export default function CompletePurchaseModal({
  visible,
  onClose,
  list,
  items,
  estimatedTotal,
  storeName,
  onComplete,
  familyId,
  userId
}: Props) {
  const [actualTotal, setActualTotal] = useState("");
  const [taxes, setTaxes] = useState("");
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (completing) return;

    const actualTotalNum = parseFloat(actualTotal) || 0;
    const taxesNum = parseFloat(taxes) || 0;

    if (actualTotalNum <= 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setCompleting(true);
    try {
      await Haptics.selectionAsync();

      // Save to shopping history
      await saveShoppingHistory({
        familyId,
        taskId: list.taskId,
        listTitle: list.title,
        storeName,
        estimatedTotal,
        actualTotal: actualTotalNum,
        taxes: taxesNum,
        currency: list.currency,
        items: items.filter(item => item.status === "purchased"),
        completedAt: new Date(),
        completedBy: userId,
        notes: notes.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error completing purchase:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCompleting(false);
    }
  };

  const difference = parseFloat(actualTotal) - estimatedTotal;
  const differencePercentage = estimatedTotal > 0 
    ? ((difference / estimatedTotal) * 100).toFixed(1)
    : "0";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.title}>Complete Purchase</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Purchase Summary</Text>
              
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>List:</Text>
                  <Text style={styles.summaryValue}>{list.title}</Text>
                </View>
                
                {storeName && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Store:</Text>
                    <Text style={styles.summaryValue}>{storeName}</Text>
                  </View>
                )}
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items:</Text>
                  <Text style={styles.summaryValue}>
                    {items.filter(item => item.status === "purchased").length} purchased
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Total:</Text>
                  <Text style={styles.summaryValue}>
                    {list.currency} {estimatedTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actual Amount */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Actual Amount Paid</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyLabel}>{list.currency}</Text>
                <TextInput
                  value={actualTotal}
                  onChangeText={setActualTotal}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <Text style={styles.helpText}>
                Enter the total amount you actually paid at the store
              </Text>
            </View>

            {/* Taxes */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Taxes (Optional)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyLabel}>{list.currency}</Text>
                <TextInput
                  value={taxes}
                  onChangeText={setTaxes}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <Text style={styles.helpText}>
                Enter the taxes paid (if you want to track them separately)
              </Text>
            </View>

            {/* Notes */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes about this purchase..."
                style={styles.notesInput}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Difference Preview */}
            {actualTotal && parseFloat(actualTotal) > 0 && (
              <View style={styles.differenceSection}>
                <Text style={styles.sectionTitle}>Price Comparison</Text>
                <View style={styles.differenceCard}>
                  <View style={styles.differenceRow}>
                    <Text style={styles.differenceLabel}>Difference:</Text>
                    <Text style={[
                      styles.differenceValue,
                      { color: difference >= 0 ? "#ef4444" : "#10b981" }
                    ]}>
                      {difference >= 0 ? "+" : ""}{list.currency} {difference.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.differenceRow}>
                    <Text style={styles.differenceLabel}>Percentage:</Text>
                    <Text style={[
                      styles.differenceValue,
                      { color: difference >= 0 ? "#ef4444" : "#10b981" }
                    ]}>
                      {difference >= 0 ? "+" : ""}{differencePercentage}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleComplete}
              style={[styles.button, styles.completeButton, completing && styles.completeButtonDisabled]}
              disabled={completing}
            >
              <Ionicons 
                name={completing ? "hourglass" : "checkmark-circle"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.completeButtonText}>
                {completing ? "Completing..." : "Complete Purchase"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  summarySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  inputSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  notesInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
    textAlignVertical: "top",
  },
  differenceSection: {
    padding: 20,
  },
  differenceCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  differenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  differenceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  differenceValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: "#10b981",
  },
  completeButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});




