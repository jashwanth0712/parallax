// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React from "react";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const App = ({ addOnUISdk, sandboxProxy }: { addOnUISdk: AddOnSDKAPI; sandboxProxy: DocumentSandboxApi }) => {
    function handleRenderRectangle() {
        try {
            // Create a rectangle using the sandbox API
            sandboxProxy.createRectangle("#5256e3");
        } catch (error) {
            console.error("Error creating rectangle:", error);
        }
    }

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="container" style={{ padding: "20px", textAlign: "center" }}>
                <Button 
                    size="m" 
                    onClick={handleRenderRectangle}
                >
                    Render Rectangle
                </Button>
            </div>
        </Theme>
    );
};

export default App;
