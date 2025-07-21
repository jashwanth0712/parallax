import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
import { DocumentSandboxApi } from "../models/DocumentSandboxApi";
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
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
