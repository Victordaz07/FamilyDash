import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShoppingHistory } from "../../types/shopping";
import { getShoppingHistory } from "../../services/shoppingHistory";

type Props = {
  visible: boolean;
  onClose: () => void;
  familyId: string;
};

export default function ShoppingHistoryModal({ visible, onClose, familyId }: Props) {
  const [history, setHistory] = useState<ShoppingHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, familyId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getShoppingHistory(familyId);
      setHistory(data);
    } catch (error) {
      console.error("Error loading shopping history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderHistoryItem = ({ item }: { item: ShoppingHistory }) => {
    const difference = item.actualTotal - item.estimatedTotal;
    const differencePercentage = item.estimatedTotal > 0 
      ? ((difference / item.estimatedTotal) * 100).toFixed(1)
      : "0";

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleContainer}>
            <Ionicons name="cart" size={20} color="#7c3aed" />
            <Text style={styles.historyTitle}>{item.listTitle}</Text>
          </View>
          <Text style={styles.historyDate}>{formatDate(item.completedAt)}</Text>
        </View>

        {item.storeName && (
          <View style={styles.storeInfo}>
            <Ionicons name="storefront" size={16} color="#6b7280" />
            <Text style={styles.storeName}>{item.storeName}</Text>
          </View>
        )}

        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated:</Text>
            <Text style={styles.totalAmount}>
              {item.currency} {item.estimatedTotal.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Actual:</Text>
            <Text style={styles.actualAmount}>
              {item.currency} {item.actualTotal.toFixed(2)}
            </Text>
          </View>

          {item.taxes > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes:</Text>
              <Text style={styles.taxesAmount}>
                {item.currency} {item.taxes.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.differenceRow}>
            <Text style={styles.differenceLabel}>Difference:</Text>
            <Text style={[
              styles.differenceAmount,
              { color: difference >= 0 ? "#ef4444" : "#10b981" }
            ]}>
              {difference >= 0 ? "+" : ""}{item.currency} {difference.toFixed(2)} ({differencePercentage}%)
            </Text>
          </View>
        </View>

        <View style={styles.itemsInfo}>
          <Text style={styles.itemsCount}>
            {item.items.length} item{item.items.length !== 1 ? "s" : ""} purchased
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="time" size={20} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Shopping History</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No Shopping History</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first shopping trip to see it here
              </Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id || item.completedAt?.toString() || Math.random().toString()}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#fff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  separator: {
    height: 16,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  historyTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  totalsContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  actualAmount: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "700",
  },
  taxesAmount: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  differenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  differenceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  differenceAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemsInfo: {
    alignItems: "center",
  },
  itemsCount: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
});
