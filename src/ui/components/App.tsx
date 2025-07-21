// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState, useRef } from "react";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

type ChartType = "bar" | "line" | "pie" | "area" | "scatter";

interface DataPoint {
    label: string;
    value: number;
    value2?: number; // For scatter plots (y-axis)
}

interface ChartSettings {
    title: string;
    xLabel: string;
    yLabel: string;
    color: string;
    showXNumbers: boolean;
    showYNumbers: boolean;
    showGrid: boolean;
}

const App = ({ addOnUISdk, sandboxProxy }: { addOnUISdk: AddOnSDKAPI; sandboxProxy: DocumentSandboxApi }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedChartType, setSelectedChartType] = useState<ChartType | null>(null);
    const [chartData, setChartData] = useState<DataPoint[]>([
        { label: "Category 1", value: 10, value2: 0 },
        { label: "Category 2", value: 25, value2: 0 }
    ]);
    const [chartSettings, setChartSettings] = useState<ChartSettings>({
        title: "My Chart",
        xLabel: "X Axis",
        yLabel: "Y Axis",
        color: "#5256e3",
        showXNumbers: true,
        showYNumbers: true,
        showGrid: true
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const steps = ["Chart Type", "Data Input", "Chart Settings"];

    const chartTypes: { value: ChartType; label: string; description: string }[] = [
        { value: "bar", label: "Bar Chart", description: "Compare categories with vertical bars" },
        { value: "line", label: "Line Chart", description: "Show trends over time" },
        { value: "pie", label: "Pie Chart", description: "Show parts of a whole" },
        { value: "area", label: "Area Chart", description: "Show cumulative totals over time" },
        { value: "scatter", label: "Scatter Plot", description: "Show relationship between two variables" }
    ];

    function handleNext() {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    }

    function handleBack() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    async function handleGenerate() {
        console.log("Generating chart with:", {
            type: selectedChartType,
            data: chartData,
            settings: chartSettings
        });
        
        // For now, add the hardcoded video as requested
        const url = "https://videos.pexels.com/video-files/3121327/3121327-uhd_2560_1440_24fps.mp4";
        const blob = await fetch(url).then((response) => response.blob());
        await addOnUISdk.app.document.addVideo(blob);
    }

    function handleChartTypeSelect(type: ChartType) {
        setSelectedChartType(type);
        // Adjust data structure based on chart type
        if (type === "scatter") {
            setChartData(prev => prev.map(item => ({ ...item, value2: item.value2 || 0 })));
        }
    }

    function handleDataChange(index: number, field: keyof DataPoint, value: string | number) {
        setChartData(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    }

    function addDataRow() {
        const newRow: DataPoint = {
            label: `Category ${chartData.length + 1}`,
            value: 0,
            ...(selectedChartType === "scatter" && { value2: 0 })
        };
        setChartData(prev => [...prev, newRow]);
    }

    function removeDataRow(index: number) {
        if (chartData.length > 1) {
            setChartData(prev => prev.filter((_, i) => i !== index));
        }
    }

    async function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            const csvData = lines.slice(1).map((line, index) => {
                const [label, value, value2] = line.split(',').map(cell => cell.trim());
                return {
                    label: label || `Row ${index + 1}`,
                    value: parseFloat(value) || 0,
                    ...(selectedChartType === "scatter" && { value2: parseFloat(value2) || 0 })
                };
            });
            if (csvData.length > 0) {
                setChartData(csvData);
            }
        }
    }

    function handleSettingChange(field: keyof ChartSettings, value: string | boolean) {
        setChartSettings(prev => ({ ...prev, [field]: value }));
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="step-content">
                        <h3>Select Chart Type</h3>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                            Choose the type of chart you want to create:
                        </p>
                        <div className="chart-types" style={{ display: "grid", gap: "12px" }}>
                            {chartTypes.map((type) => (
                                <div 
                                    key={type.value}
                                    className="chart-type-option"
                                    onClick={() => handleChartTypeSelect(type.value)}
                                    style={{
                                        padding: "16px",
                                        border: `2px solid ${selectedChartType === type.value ? "#5256e3" : "#e0e0e0"}`,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        backgroundColor: selectedChartType === type.value ? "#f8f9ff" : "white",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                                        {type.label}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#666" }}>
                                        {type.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 1:
                return (
                    <div className="step-content">
                        <h3>Enter Data</h3>
                        
                        <div style={{ marginBottom: "16px" }}>
                            <Button size="s" onClick={() => fileInputRef.current?.click()} variant="secondary">
                                Upload CSV
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                style={{ display: "none" }}
                                onChange={handleCSVUpload}
                            />
                            <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>
                                or enter data manually below
                            </span>
                        </div>

                        <div className="data-table" style={{ marginBottom: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: selectedChartType === "scatter" ? "2fr 1fr 1fr auto" : "2fr 1fr auto", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                                <div style={{ fontWeight: "bold", fontSize: "12px" }}>Label</div>
                                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                                    {selectedChartType === "scatter" ? "X Value" : "Value"}
                                </div>
                                {selectedChartType === "scatter" && (
                                    <div style={{ fontWeight: "bold", fontSize: "12px" }}>Y Value</div>
                                )}
                                <div></div>
                            </div>
                            
                            {chartData.map((row, index) => (
                                <div key={index} style={{ display: "grid", gridTemplateColumns: selectedChartType === "scatter" ? "2fr 1fr 1fr auto" : "2fr 1fr auto", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                                    <input
                                        type="text"
                                        value={row.label}
                                        onChange={(e) => handleDataChange(index, "label", e.target.value)}
                                        style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                    <input
                                        type="number"
                                        value={row.value}
                                        onChange={(e) => handleDataChange(index, "value", parseFloat(e.target.value) || 0)}
                                        style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                    {selectedChartType === "scatter" && (
                                        <input
                                            type="number"
                                            value={row.value2 || 0}
                                            onChange={(e) => handleDataChange(index, "value2", parseFloat(e.target.value) || 0)}
                                            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                        />
                                    )}
                                    <Button 
                                        size="s" 
                                        onClick={() => removeDataRow(index)}
                                        disabled={chartData.length <= 1}
                                        variant="negative"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button size="s" onClick={addDataRow} variant="secondary">
                            Add Row
                        </Button>
                    </div>
                );
            
            case 2:
                return (
                    <div className="step-content">
                        <h3>Chart Settings</h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div className="settings-panel">
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                        Chart Title
                                    </label>
                                    <input
                                        type="text"
                                        value={chartSettings.title}
                                        onChange={(e) => handleSettingChange("title", e.target.value)}
                                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                        X-Axis Label
                                    </label>
                                    <input
                                        type="text"
                                        value={chartSettings.xLabel}
                                        onChange={(e) => handleSettingChange("xLabel", e.target.value)}
                                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                        Y-Axis Label
                                    </label>
                                    <input
                                        type="text"
                                        value={chartSettings.yLabel}
                                        onChange={(e) => handleSettingChange("yLabel", e.target.value)}
                                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                        Chart Color
                                    </label>
                                    <input
                                        type="color"
                                        value={chartSettings.color}
                                        onChange={(e) => handleSettingChange("color", e.target.value)}
                                        style={{ width: "100%", height: "40px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                                        <input
                                            type="checkbox"
                                            checked={chartSettings.showXNumbers}
                                            onChange={(e) => handleSettingChange("showXNumbers", e.target.checked)}
                                            style={{ marginRight: "8px" }}
                                        />
                                        Show X-axis numbers
                                    </label>
                                </div>

                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                                        <input
                                            type="checkbox"
                                            checked={chartSettings.showYNumbers}
                                            onChange={(e) => handleSettingChange("showYNumbers", e.target.checked)}
                                            style={{ marginRight: "8px" }}
                                        />
                                        Show Y-axis numbers
                                    </label>
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                                        <input
                                            type="checkbox"
                                            checked={chartSettings.showGrid}
                                            onChange={(e) => handleSettingChange("showGrid", e.target.checked)}
                                            style={{ marginRight: "8px" }}
                                        />
                                        Show grid lines
                                    </label>
                                </div>
                            </div>

                            <div className="preview-panel">
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                                    Chart Preview (4:3)
                                </label>
                                <div 
                                    className="chart-preview"
                                    style={{
                                        width: "100%",
                                        aspectRatio: "4/3",
                                        border: "2px dashed #ccc",
                                        borderRadius: "8px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f9f9f9",
                                        padding: "16px"
                                    }}
                                >
                                    <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: chartSettings.color }}>
                                        {chartSettings.title}
                                    </div>
                                    <div style={{ fontSize: "48px", color: "#ccc", marginBottom: "8px" }}>
                                        📊
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
                                        {selectedChartType ? `${chartTypes.find(t => t.value === selectedChartType)?.label} Preview` : "Select a chart type"}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
                                        {chartData.length} data points
                                    </div>
                                </div>

                                <div style={{ marginTop: "16px" }}>
                                    <Button 
                                        size="m" 
                                        onClick={handleGenerate}
                                        disabled={!selectedChartType || chartData.length === 0}
                                        style={{ width: "100%" }}
                                    >
                                        Generate Chart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return selectedChartType !== null;
            case 1:
                return chartData.length > 0 && chartData.some(item => item.label.trim() !== "");
            case 2:
                return true;
            default:
                return false;
        }
    };

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="container">
                {/* Horizontal Stepper */}
                <div className="stepper-container" style={{ marginBottom: "24px" }}>
                    <div className="stepper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        {steps.map((step, index) => (
                            <div key={index} className="stepper-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                                <div 
                                    className="stepper-circle" 
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: index <= currentStep ? "#5256e3" : "#e0e0e0",
                                        color: index <= currentStep ? "white" : "#999",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        marginBottom: "8px"
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <div 
                                    className="stepper-label" 
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: index === currentStep ? "bold" : "normal",
                                        color: index <= currentStep ? "#5256e3" : "#999",
                                        textAlign: "center"
                                    }}
                                >
                                    {step}
                                </div>
                                {index < steps.length - 1 && (
                                    <div 
                                        className="stepper-line" 
                                        style={{
                                            position: "absolute",
                                            top: "16px",
                                            left: "calc(50% + 16px)",
                                            width: "calc(100% - 32px)",
                                            height: "2px",
                                            backgroundColor: index < currentStep ? "#5256e3" : "#e0e0e0",
                                            zIndex: -1
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="step-content-container" style={{ minHeight: "400px", marginBottom: "20px" }}>
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="navigation-buttons" style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <Button 
                        size="m" 
                        onClick={handleBack} 
                        disabled={currentStep === 0}
                        variant="secondary"
                    >
                        Back
                    </Button>
                    
                    <Button 
                        size="m" 
                        onClick={handleNext} 
                        disabled={currentStep === steps.length - 1 || !canProceed()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Theme>
    );
};

export default App;
