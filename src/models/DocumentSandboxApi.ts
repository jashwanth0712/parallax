// This interface declares all the APIs that the document sandbox runtime ( i.e. code.ts ) exposes to the UI/iframe runtime

export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    children?: FigmaNode[];
}

export interface DocumentSandboxApi {
    createRectangle(color?: string): void;
    createSquare(color?: string): void;
    createCircle(color?: string): void;
    
    // Enhanced methods for Figma integration
    createRectangleAt(x: number, y: number, width: number, height: number, color?: string): void;
    createTextAt(x: number, y: number, text: string, fontSize?: number, color?: string): void;
    fetchFigmaFile(fileKey: string, accessToken: string): Promise<any>;
    renderFigmaNode(node: FigmaNode): void;
    renderFigmaComponent(nodes: FigmaNode[]): void;
    clearCanvas(): void;
}
