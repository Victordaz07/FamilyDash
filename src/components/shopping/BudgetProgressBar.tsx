import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  spent: number;
  budget: number;
  currency: string;
  showExcess?: boolean; // Show excess amount in red when over budget
};

export default function BudgetProgressBar({ spent, budget, currency, showExcess = true }: Props) {
  const percentage = Math.min(1, spent / budget); // Cap at 100% for bar width
  const isOverBudget = spent > budget;
  const excess = Math.max(0, spent - budget);
  
  const getBarColor = () => {
    if (isOverBudget) return "#ef4444"; // Red when over budget
    if (percentage >= 0.8) return "#f59e0b"; // Orange at 80%+
    return "#10b981"; // Green below 80%
  };

  const getTextColor = () => {
    return isOverBudget ? "#dc2626" : "#374151";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={20} color="#6b7280" />
        </View>
        <Text style={styles.label}>Presupuesto Total</Text>
      </View>
      
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View 
            style={[
              styles.barFill, 
              { 
                width: `${percentage * 100}%`, 
                backgroundColor: getBarColor()
              }
            ]} 
          />
          {/* Excess indicator - continues beyond 100% */}
          {isOverBudget && (
            <View 
              style={[
                styles.excessBar,
                { 
                  left: "100%",
                  width: `${Math.min(50, (excess / budget) * 100)}%`, // Max 50% additional width
                  backgroundColor: "#dc2626"
                }
              ]} 
            />
          )}
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.spentAmount, { color: getTextColor() }]}>
          {currency} {spent.toFixed(2)}
        </Text>
        <Text style={styles.budgetAmount}>
          de {currency} {budget.toFixed(2)}
        </Text>
        <Text style={styles.percentage}>
          ({Math.round(percentage * 100)}%)
        </Text>
      </View>
      
      {/* Excess message in red */}
      {isOverBudget && showExcess && (
        <View style={styles.excessContainer}>
          <View style={styles.excessIcon}>
            <Ionicons name="warning" size={16} color="#dc2626" />
          </View>
          <Text style={styles.excessText}>
            Excedido por {currency} {excess.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  barContainer: {
    marginBottom: 12,
  },
  barBackground: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: 12,
    borderRadius: 8,
  },
  excessBar: {
    height: 12,
    position: "absolute",
    top: 0,
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  budgetAmount: {
    fontSize: 14,
    color: "#6b7280",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  excessContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  excessIcon: {
    marginRight: 8,
  },
  excessText: {
    flex: 1,
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
});




