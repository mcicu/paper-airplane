import './globals.css';
import React from "react";
//import Header from "@/components/Header/header";

export default function Layout({children} : React.PropsWithChildren) {
    return (
        <html>
        <body>
        {children}
        </body>
        </html>
    )
}