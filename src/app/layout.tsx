import './globals.css';
import React from "react";

export default function Layout({children}: React.PropsWithChildren) {
    return (
        <html className="h-full">
        <head>
            <title>Paper Airplanes</title>
        </head>
        <body className="h-full">
        {children}
        </body>
        </html>
    )
}