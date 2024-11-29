import './globals.css';
import React from "react";

export default function Layout({children}: React.PropsWithChildren) {
    return (
        <html>
        <head>
            <title>Paper Airplanes</title>
        </head>
        <body>
        {children}
        </body>
        </html>
    )
}