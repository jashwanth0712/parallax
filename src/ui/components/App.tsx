// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import { DocumentSandboxApi, FigmaNode } from "../../models/DocumentSandboxApi";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const App = ({ addOnUISdk, sandboxProxy }: { addOnUISdk: AddOnSDKAPI; sandboxProxy: DocumentSandboxApi }) => {
    const [figmaToken, setFigmaToken] = useState("");
    const [figmaFileKey, setFigmaFileKey] = useState("");
    const [figmaData, setFigmaData] = useState<any>(null);
    const [selectedNodes, setSelectedNodes] = useState<FigmaNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Extract file key from Figma URL
    const extractFileKey = (url: string): string => {
        const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
        return match ? match[1] : url;
    };

    const handleConnect = async () => {
        if (!figmaToken || !figmaFileKey) {
            setError("Please provide both Figma token and file key/URL");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const fileKey = extractFileKey(figmaFileKey);
            const data = await sandboxProxy.fetchFigmaFile(fileKey, figmaToken);
            setFigmaData(data);
            console.log("Figma data loaded:", data);
        } catch (err) {
            setError("Failed to connect to Figma. Please check your token and file key.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderFigmaNodes = (nodes: any[], level = 0): JSX.Element[] => {
        return nodes.map((node) => {
            const isSelectable = ["RECTANGLE", "TEXT", "FRAME"].includes(node.type);
            
            return (
                <div key={node.id} style={{ marginLeft: level * 20 }}>
                    <div 
                        style={{ 
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: isSelectable ? "#f5f5f5" : "transparent",
                            borderRadius: "4px",
                            marginBottom: "4px",
                            cursor: isSelectable ? "pointer" : "default"
                        }}
                        onClick={() => isSelectable && handleNodeSelect(node)}
                    >
                        <span style={{ 
                            fontSize: "12px",
                            fontWeight: level === 0 ? "bold" : "normal",
                            color: isSelectable ? "#5256e3" : "#666"
                        }}>
                            {node.type} - {node.name}
                            {isSelectable && (
                                <span style={{ marginLeft: "8px", fontSize: "10px", color: "#999" }}>
                                    (click to select)
                                </span>
                            )}
                        </span>
                    </div>
                    {node.children && renderFigmaNodes(node.children, level + 1)}
                </div>
            );
        });
    };

    const handleNodeSelect = (node: any) => {
        const parsedNode = parseFigmaNodeForUI(node);
        const isAlreadySelected = selectedNodes.some(n => n.id === parsedNode.id);
        
        if (isAlreadySelected) {
            setSelectedNodes(prev => prev.filter(n => n.id !== parsedNode.id));
        } else {
            setSelectedNodes(prev => [...prev, parsedNode]);
        }
    };

    const parseFigmaNodeForUI = (figmaNode: any): FigmaNode => {
        return {
            id: figmaNode.id,
            name: figmaNode.name,
            type: figmaNode.type,
            x: figmaNode.absoluteBoundingBox?.x || 0,
            y: figmaNode.absoluteBoundingBox?.y || 0,
            width: figmaNode.absoluteBoundingBox?.width,
            height: figmaNode.absoluteBoundingBox?.height,
            fill: figmaNode.fills && figmaNode.fills[0]?.color ? 
                `#${Math.round(figmaNode.fills[0].color.r * 255).toString(16).padStart(2, '0')}${Math.round(figmaNode.fills[0].color.g * 255).toString(16).padStart(2, '0')}${Math.round(figmaNode.fills[0].color.b * 255).toString(16).padStart(2, '0')}` : 
                "#5256e3",
            text: figmaNode.characters,
            fontSize: figmaNode.style?.fontSize,
            fontFamily: figmaNode.style?.fontFamily
        };
    };

    const handleImportToExpress = async () => {
        if (selectedNodes.length === 0) {
            setError("Please select at least one node to import");
            return;
        }

        try {
            sandboxProxy.clearCanvas();
            sandboxProxy.renderFigmaComponent(selectedNodes);
            setError("");
        } catch (err) {
            setError("Failed to import to Adobe Express");
            console.error(err);
        }
    };

    const handleClearSelection = () => {
        setSelectedNodes([]);
    };

    const handleClearCanvas = () => {
        sandboxProxy.clearCanvas();
    };

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="container" style={{ padding: "20px", maxHeight: "600px", overflow: "auto" }}>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>Figma → Adobe Express Integrator</h2>
                
                {/* Connection Section */}
                <div className="connection-section" style={{ marginBottom: "20px", padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                    <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Connect to Figma</h3>
                    
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                            Figma Access Token
                        </label>
                        <input
                            type="password"
                            value={figmaToken}
                            onChange={(e) => setFigmaToken(e.target.value)}
                            placeholder="Enter your Figma access token"
                            style={{ 
                                width: "100%", 
                                padding: "8px", 
                                border: "1px solid #ccc", 
                                borderRadius: "4px", 
                                fontSize: "14px" 
                            }}
                        />
                        <small style={{ fontSize: "12px", color: "#666" }}>
                            Get your token from Figma Settings → Personal Access Tokens
                        </small>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                            Figma File URL or Key
                        </label>
                        <input
                            type="text"
                            value={figmaFileKey}
                            onChange={(e) => setFigmaFileKey(e.target.value)}
                            placeholder="https://www.figma.com/file/ABC123... or just ABC123"
                            style={{ 
                                width: "100%", 
                                padding: "8px", 
                                border: "1px solid #ccc", 
                                borderRadius: "4px", 
                                fontSize: "14px" 
                            }}
                        />
                    </div>

                    <Button 
                        size="m" 
                        onClick={handleConnect}
                        disabled={loading || !figmaToken || !figmaFileKey}
                    >
                        {loading ? "Connecting..." : "Connect to Figma"}
                    </Button>
                </div>

                {error && (
                    <div style={{ 
                        padding: "12px", 
                        backgroundColor: "#ffebee", 
                        color: "#c62828", 
                        borderRadius: "4px", 
                        marginBottom: "16px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                {/* File Browser Section */}
                {figmaData && (
                    <div className="file-browser" style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "16px" }}>Browse Figma File</h3>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Button size="s" onClick={handleClearSelection} variant="secondary">
                                    Clear Selection ({selectedNodes.length})
                                </Button>
                                <Button size="s" onClick={handleClearCanvas} variant="secondary">
                                    Clear Canvas
                                </Button>
                            </div>
                        </div>
                        
                        <div style={{ 
                            border: "1px solid #e0e0e0", 
                            borderRadius: "8px", 
                            padding: "16px", 
                            maxHeight: "300px", 
                            overflow: "auto",
                            backgroundColor: "#fafafa"
                        }}>
                            <div style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "bold" }}>
                                {figmaData.name}
                            </div>
                            {figmaData.document && figmaData.document.children && 
                                renderFigmaNodes(figmaData.document.children)
                            }
                        </div>
                    </div>
                )}

                {/* Selected Nodes Section */}
                {selectedNodes.length > 0 && (
                    <div className="selected-nodes" style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>
                            Selected Components ({selectedNodes.length})
                        </h3>
                        
                        <div style={{ 
                            border: "1px solid #e0e0e0", 
                            borderRadius: "8px", 
                            padding: "12px",
                            backgroundColor: "#f8f9ff"
                        }}>
                            {selectedNodes.map(node => (
                                <div key={node.id} style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    padding: "8px",
                                    marginBottom: "4px",
                                    backgroundColor: "white",
                                    borderRadius: "4px",
                                    fontSize: "14px"
                                }}>
                                    <span>
                                        <strong>{node.type}</strong> - {node.name}
                                        {node.width && node.height && (
                                            <small style={{ color: "#666", marginLeft: "8px" }}>
                                                {Math.round(node.width)} × {Math.round(node.height)}
                                            </small>
                                        )}
                                    </span>
                                    <button 
                                        onClick={() => setSelectedNodes(prev => prev.filter(n => n.id !== node.id))}
                                        style={{ 
                                            background: "none", 
                                            border: "none", 
                                            cursor: "pointer", 
                                            color: "#666",
                                            fontSize: "16px"
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: "16px" }}>
                            <Button 
                                size="m" 
                                onClick={handleImportToExpress}
                                style={{ width: "100%" }}
                            >
                                Import to Adobe Express
                            </Button>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="help-section" style={{ 
                    marginTop: "20px", 
                    padding: "16px", 
                    backgroundColor: "#f5f5f5", 
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#666"
                }}>
                    <strong>How to use:</strong>
                    <ol style={{ marginTop: "8px", paddingLeft: "20px" }}>
                        <li>Get a Figma personal access token from your account settings</li>
                        <li>Copy the URL of the Figma file you want to import from</li>
                        <li>Connect to see the file structure</li>
                        <li>Click on rectangles, text, or frames to select them</li>
                        <li>Import selected components to Adobe Express</li>
                    </ol>
                </div>
            </div>
        </Theme>
    );
};

export default App;
