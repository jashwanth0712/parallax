// This interface declares all the APIs that the document sandbox runtime ( i.e. code.ts ) exposes to the UI/iframe runtime
export interface DocumentSandboxApi {
    createRectangle(color?: string): void;
    createSquare(color?: string): void;
    createCircle(color?: string): void;
}
