/**
 * Data Export/Import Screen
 * Comprehensive data management interface
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DataExportImportManager, { ExportOptions, ImportResult } from '@/services/data/DataExportImportManager';

interface DataExportImportScreenProps {
    navigation: any;
}

const DataExportImportScreen: React.FC<DataExportImportScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'json',
        includeTasks: true,
        includeGoals: true,
        includePenalties: true,
        includeCalendar: true,
        includeSafeRoom: true,
        includeProfile: true,
    });
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: '',
    });

    const dataManager = DataExportImportManager.getInstance();

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const options = {
                ...exportOptions,
                dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
            };

            const filePath = await dataManager.exportData(options);

            // Share the file
            await dataManager.shareFile(filePath);

            Alert.alert('Success', 'Data exported successfully!');
            setShowExportModal(false);
        } catch (error) {
            Alert.alert('Export Failed', error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async () => {
        try {
            setIsImporting(true);

            const filePath = await dataManager.pickFileForImport();

            if (!filePath) {
                Alert.alert('No File Selected', 'Please select a file to import.');
                return;
            }

            const result = await dataManager.importData(filePath);
            setImportResult(result);

            if (result.success) {
                Alert.alert('Success', `Successfully imported ${result.importedRecords} records!`);
            } else {
                Alert.alert('Import Failed', result.errors.join('\n'));
            }

            setShowImportModal(false);
        } catch (error) {
            Alert.alert('Import Failed', error.message);
        } finally {
            setIsImporting(false);
        }
    };

    const generateReport = async () => {
        try {
            setIsExporting(true);

            const report = await dataManager.generateFamilyReport();
            const filePath = await dataManager.exportData({
                ...exportOptions,
                format: 'pdf',
            });

            await dataManager.shareFile(filePath);

            Alert.alert('Success', 'Family report generated successfully!');
        } catch (error) {
            Alert.alert('Report Generation Failed', error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const ExportModal = () => (
        <Modal
            visible={showExportModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Export Data</Text>
                    <TouchableOpacity
                        onPress={() => setShowExportModal(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Format Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Export Format</Text>
                        <View style={styles.formatOptions}>
                            {[
                                { value: 'json', label: 'JSON', description: 'Complete data with metadata' },
                                { value: 'pdf', label: 'PDF Report', description: 'Formatted family report' },
                                { value: 'csv', label: 'CSV', description: 'Spreadsheet format' },
                            ].map((format) => (
                                <TouchableOpacity
                                    key={format.value}
                                    style={[
                                        styles.formatOption,
                                        exportOptions.format === format.value && styles.formatOptionSelected
                                    ]}
                                    onPress={() => setExportOptions({ ...exportOptions, format: format.value as any })}
                                >
                                    <View style={styles.formatOptionContent}>
                                        <Text style={[
                                            styles.formatOptionLabel,
                                            exportOptions.format === format.value && styles.formatOptionLabelSelected
                                        ]}>
                                            {format.label}
                                        </Text>
                                        <Text style={styles.formatOptionDescription}>
                                            {format.description}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={exportOptions.format === format.value ? "radio-button-on" : "radio-button-off"}
                                        size={20}
                                        color={exportOptions.format === format.value ? "#3B82F6" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Data Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Include Data</Text>
                        {[
                            { key: 'includeTasks', label: 'Tasks', description: 'Family tasks and assignments' },
                            { key: 'includeGoals', label: 'Goals', description: 'Family goals and progress' },
                            { key: 'includePenalties', label: 'Penalties', description: 'Penalty records and reflections' },
                            { key: 'includeCalendar', label: 'Calendar', description: 'Events and activities' },
                            { key: 'includeSafeRoom', label: 'Safe Room', description: 'Emotional messages and support' },
                            { key: 'includeProfile', label: 'Profile', description: 'Family member profiles' },
                        ].map((option) => (
                            <View key={option.key} style={styles.dataOption}>
                                <View style={styles.dataOptionInfo}>
                                    <Text style={styles.dataOptionLabel}>{option.label}</Text>
                                    <Text style={styles.dataOptionDescription}>{option.description}</Text>
                                </View>
                                <Switch
                                    value={exportOptions[option.key as keyof ExportOptions] as boolean}
                                    onValueChange={(value) => setExportOptions({ ...exportOptions, [option.key]: value })}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        ))}
                    </View>

                    {/* Date Range */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Date Range (Optional)</Text>
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateInputContainer}>
                                <Text style={styles.dateLabel}>Start Date</Text>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="YYYY-MM-DD"
                                    value={dateRange.start}
                                    onChangeText={(text) => setDateRange({ ...dateRange, start: text })}
                                />
                            </View>
                            <View style={styles.dateInputContainer}>
                                <Text style={styles.dateLabel}>End Date</Text>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="YYYY-MM-DD"
                                    value={dateRange.end}
                                    onChangeText={(text) => setDateRange({ ...dateRange, end: text })}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.primaryButton]}
                        onPress={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="download" size={20} color="white" />
                                <Text style={styles.modalButtonText}>Export Data</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const ImportModal = () => (
        <Modal
            visible={showImportModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Import Data</Text>
                    <TouchableOpacity
                        onPress={() => setShowImportModal(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                    <View style={styles.importInfo}>
                        <Ionicons name="information-circle" size={48} color="#3B82F6" />
                        <Text style={styles.importTitle}>Import Family Data</Text>
                        <Text style={styles.importDescription}>
                            Select a JSON or CSV file to import your family data. This will add the imported data to your existing data.
                        </Text>
                    </View>

                    <View style={styles.supportedFormats}>
                        <Text style={styles.supportedFormatsTitle}>Supported Formats:</Text>
                        <View style={styles.formatList}>
                            <View style={styles.formatItem}>
                                <Ionicons name="document-text" size={20} color="#10B981" />
                                <Text style={styles.formatItemText}>JSON - Complete data export</Text>
                            </View>
                            <View style={styles.formatItem}>
                                <Ionicons name="grid" size={20} color="#F59E0B" />
                                <Text style={styles.formatItemText}>CSV - Spreadsheet format</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.primaryButton]}
                        onPress={handleImport}
                        disabled={isImporting}
                    >
                        {isImporting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="white" />
                                <Text style={styles.modalButtonText}>Select File</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data Management</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Export Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Export Data</Text>
                    <Text style={styles.sectionDescription}>
                        Export your family data in various formats for backup or sharing.
                    </Text>

                    <View style={styles.actionCards}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => setShowExportModal(true)}
                        >
                            <LinearGradient
                                colors={['#10B981', '#047857']}
                                style={styles.actionCardGradient}
                            >
                                <Ionicons name="download" size={32} color="white" />
                                <Text style={styles.actionCardTitle}>Export Data</Text>
                                <Text style={styles.actionCardDescription}>
                                    Export family data in JSON, PDF, or CSV format
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={generateReport}
                            disabled={isExporting}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.actionCardGradient}
                            >
                                {isExporting ? (
                                    <ActivityIndicator color="white" size="large" />
                                ) : (
                                    <Ionicons name="document-text" size={32} color="white" />
                                )}
                                <Text style={styles.actionCardTitle}>Generate Report</Text>
                                <Text style={styles.actionCardDescription}>
                                    Create a comprehensive family activity report
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Import Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Import Data</Text>
                    <Text style={styles.sectionDescription}>
                        Import previously exported data to restore or merge with existing data.
                    </Text>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => setShowImportModal(true)}
                    >
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']}
                            style={styles.actionCardGradient}
                        >
                            <Ionicons name="cloud-upload" size={32} color="white" />
                            <Text style={styles.actionCardTitle}>Import Data</Text>
                            <Text style={styles.actionCardDescription}>
                                Import data from JSON or CSV files
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Import Result */}
                {importResult && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Import Result</Text>
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Ionicons
                                    name={importResult.success ? "checkmark-circle" : "close-circle"}
                                    size={24}
                                    color={importResult.success ? "#10B981" : "#EF4444"}
                                />
                                <Text style={[
                                    styles.resultTitle,
                                    { color: importResult.success ? "#10B981" : "#EF4444" }
                                ]}>
                                    {importResult.success ? "Import Successful" : "Import Failed"}
                                </Text>
                            </View>

                            <Text style={styles.resultText}>
                                Imported {importResult.importedRecords} records
                            </Text>

                            {importResult.errors.length > 0 && (
                                <View style={styles.errorList}>
                                    <Text style={styles.errorTitle}>Errors:</Text>
                                    {importResult.errors.map((error, index) => (
                                        <Text key={index} style={styles.errorText}>• {error}</Text>
                                    ))}
                                </View>
                            )}

                            {importResult.warnings.length > 0 && (
                                <View style={styles.warningList}>
                                    <Text style={styles.warningTitle}>Warnings:</Text>
                                    {importResult.warnings.map((warning, index) => (
                                        <Text key={index} style={styles.warningText}>• {warning}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management Tips</Text>
                    <View style={styles.tipsCard}>
                        <View style={styles.tip}>
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                            <Text style={styles.tipText}>
                                Regular exports ensure your family data is always backed up
                            </Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="time" size={20} color="#F59E0B" />
                            <Text style={styles.tipText}>
                                Use date ranges to export specific time periods
                            </Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="document-text" size={20} color="#8B5CF6" />
                            <Text style={styles.tipText}>
                                PDF reports are perfect for sharing with family members
                            </Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="warning" size={20} color="#EF4444" />
                            <Text style={styles.tipText}>
                                Importing data will add to existing data, not replace it
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <ExportModal />
            <ImportModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1F2937',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    actionCards: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionCardGradient: {
        padding: 20,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    actionCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
        marginBottom: 4,
    },
    actionCardDescription: {
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
        opacity: 0.9,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    formatOptions: {
        gap: 8,
    },
    formatOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    formatOptionSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#F0F9FF',
    },
    formatOptionContent: {
        flex: 1,
    },
    formatOptionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    formatOptionLabelSelected: {
        color: '#3B82F6',
    },
    formatOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    dataOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dataOptionInfo: {
        flex: 1,
    },
    dataOptionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    dataOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    dateRangeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInputContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: 'white',
    },
    modalFooter: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    importInfo: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
    },
    importTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 12,
        marginBottom: 8,
    },
    importDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    supportedFormats: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    supportedFormatsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    formatList: {
        gap: 8,
    },
    formatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    formatItemText: {
        fontSize: 14,
        color: '#374151',
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    resultText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 12,
    },
    errorList: {
        marginBottom: 12,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginLeft: 8,
    },
    warningList: {
        marginBottom: 12,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#F59E0B',
        marginLeft: 8,
    },
    tipsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginLeft: 12,
    },
});

export default DataExportImportScreen;

