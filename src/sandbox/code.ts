import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
import { DocumentSandboxApi, FigmaNode } from "../models/DocumentSandboxApi";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

// Declare fetch as it's available in the sandbox environment
declare const fetch: any;

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { red: number; green: number; blue: number; alpha: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Default to blue if invalid hex
    if (!/^[0-9A-F]{6}$/i.test(hex)) {
        return { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };
    }
    
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return { red: r, green: g, blue: b, alpha: 1 };
}

// Helper function to extract color from Figma fills
function getFigmaColor(fills?: any[]): string {
    if (!fills || fills.length === 0) return "#5256e3";
    
    const fill = fills[0];
    if (fill.type === "SOLID" && fill.color) {
        const { r, g, b } = fill.color;
        const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return "#5256e3";
}

// Helper function to parse Figma node recursively
function parseFigmaNode(figmaNode: any): FigmaNode {
    const node: FigmaNode = {
        id: figmaNode.id,
        name: figmaNode.name,
        type: figmaNode.type,
        x: figmaNode.absoluteBoundingBox?.x || 0,
        y: figmaNode.absoluteBoundingBox?.y || 0,
        width: figmaNode.absoluteBoundingBox?.width,
        height: figmaNode.absoluteBoundingBox?.height
    };

    // Handle different node types
    if (figmaNode.type === "RECTANGLE" && figmaNode.fills) {
        node.fill = getFigmaColor(figmaNode.fills);
    }
    
    if (figmaNode.type === "TEXT" && figmaNode.characters) {
        node.text = figmaNode.characters;
        node.fontSize = figmaNode.style?.fontSize || 16;
        node.fontFamily = figmaNode.style?.fontFamily || "Arial";
        node.fill = getFigmaColor(figmaNode.fills);
    }

    // Recursively parse children
    if (figmaNode.children && figmaNode.children.length > 0) {
        node.children = figmaNode.children.map(parseFigmaNode);
    }

    return node;
}

function start(): void {
    // APIs to be exposed to the UI runtime
    // i.e., to the `App.tsx` file of this add-on.
    const sandboxApi: DocumentSandboxApi = {
        createRectangle: (color?: string) => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;

            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };

            // Define rectangle color.
            const rgbColor = color ? hexToRgb(color) : { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(rgbColor);
            rectangle.fill = rectangleFill;

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },

        createSquare: (color?: string) => {
            const square = editor.createRectangle();

            // Define square dimensions (equal width and height).
            square.width = 200;
            square.height = 200;

            // Define square position.
            square.translation = { x: 10, y: 10 };

            // Define square color.
            const rgbColor = color ? hexToRgb(color) : { red: 0.89, green: 0.32, blue: 0.34, alpha: 1 };

            // Fill the square with the color.
            const squareFill = editor.makeColorFill(rgbColor);
            square.fill = squareFill;

            // Add the square to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(square);
        },

        createCircle: (color?: string) => {
            const circle = editor.createEllipse();

            // Define circle position.
            circle.translation = { x: 10, y: 10 };

            // Resize circle to make it a perfect circle (200x200)
            circle.rx = 100;
            circle.ry = 100;

            // Define circle color.
            const rgbColor = color ? hexToRgb(color) : { red: 0.34, green: 0.89, blue: 0.32, alpha: 1 };

            // Fill the circle with the color.
            const circleFill = editor.makeColorFill(rgbColor);
            circle.fill = circleFill;

            // Add the circle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(circle);
        },

        createRectangleAt: (x: number, y: number, width: number, height: number, color?: string) => {
            const rectangle = editor.createRectangle();
            
            rectangle.width = width;
            rectangle.height = height;
            rectangle.translation = { x, y };
            
            const rgbColor = color ? hexToRgb(color) : { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };
            const rectangleFill = editor.makeColorFill(rgbColor);
            rectangle.fill = rectangleFill;
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },

        createTextAt: (x: number, y: number, text: string, fontSize: number = 16, color?: string) => {
            const textNode = editor.createText();
            
            textNode.text = text;
            textNode.translation = { x, y };
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
        },

        fetchFigmaFile: async (fileKey: string, accessToken: string): Promise<any> => {
            try {
                const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
                    headers: {
                        'X-Figma-Token': accessToken
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch Figma file: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching Figma file:", error);
                throw error;
            }
        },

        renderFigmaNode: (node: FigmaNode) => {
            const scaleFactor = 0.5; // Scale down by 50%
            
            switch (node.type) {
                case "RECTANGLE":
                    if (node.width && node.height && node.x !== undefined && node.y !== undefined) {
                        sandboxApi.createRectangleAt(
                            node.x * scaleFactor,
                            node.y * scaleFactor,
                            node.width * scaleFactor,
                            node.height * scaleFactor,
                            node.fill
                        );
                    }
                    break;
                    
                case "TEXT":
                    if (node.text && node.x !== undefined && node.y !== undefined) {
                        sandboxApi.createTextAt(
                            node.x * scaleFactor,
                            node.y * scaleFactor,
                            node.text,
                            (node.fontSize || 16) * scaleFactor,
                            node.fill
                        );
                    }
                    break;
                    
                case "FRAME":
                case "GROUP":
                    // Render background if it's a frame with a fill
                    if (node.type === "FRAME" && node.fill && node.width && node.height && node.x !== undefined && node.y !== undefined) {
                        sandboxApi.createRectangleAt(
                            node.x * scaleFactor,
                            node.y * scaleFactor,
                            node.width * scaleFactor,
                            node.height * scaleFactor,
                            node.fill
                        );
                    }
                    break;
            }
            
            // Recursively render children
            if (node.children) {
                node.children.forEach(child => sandboxApi.renderFigmaNode(child));
            }
        },

        renderFigmaComponent: (nodes: FigmaNode[]) => {
            nodes.forEach(node => sandboxApi.renderFigmaNode(node));
        },

        clearCanvas: () => {
            const insertionParent = editor.context.insertionParent;
            // Clear all children
            const children = [...insertionParent.children];
            children.forEach(child => {
                insertionParent.children.remove(child);
            });
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
