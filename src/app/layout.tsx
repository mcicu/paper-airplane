import './globals.css';
import React from "react";

export default function Layout({children} : React.PropsWithChildren) {
    return (
        <html>
        <head>
            <script src="https://telegram.org/js/telegram-web-app.js?56" async></script>
        </head>
        <body>
        {children}
        </body>
        </html>
    )
}